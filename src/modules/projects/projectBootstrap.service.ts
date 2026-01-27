import { ProjectRepository } from "./project.repository";
import { UserRepository } from "../users/user.repository";
import { RoleRepository } from "../roles/role.repository";
import { UserRoleRepository } from "../../repositories/userRole.repository";
import { ProjectUserRepository } from "../../repositories/projectUser.repository";
import { prisma } from "../../lib/prisma";
import { generateKey, generateHash } from "../../utils/keyGenerator";
import { 
    assertProjectName, 
    assertProjectNameIsNotRepeated 
} from "./project.guards";

export type BootstrapProjectData = {
    projectName: string;
    username: string;
    email: string;
    passwordHash: string;
}

export class ProjectBootstrapService {
    constructor(
        private projectRepository: ProjectRepository,
        private userRepository: UserRepository,
        private roleRepository: RoleRepository,
        private userRoleRepository: UserRoleRepository,
        private projectUserRepository: ProjectUserRepository
    ) {}

    async bootstrapProject(data: BootstrapProjectData) {
        const { projectName, username, email, passwordHash } = data;

        // 1. Validation (Business logic before transaction if possible, or inside)
        assertProjectName(projectName);
        
        return await prisma.$transaction(async (tx) => {
            // Check if project name already exists
            const existingProject = await this.projectRepository.getProjectByName(projectName, tx);
            assertProjectNameIsNotRepeated(existingProject?.name, projectName);

            // 2. Generation of api_key
            const apiKey = await generateKey();
            const apiKeyHash = await generateHash(apiKey);

            // 3. Create project
            const project = await this.projectRepository.createProject({
                name: projectName,
                api_key: apiKeyHash,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            }, tx);

            // 4. Create bootstrap user (or get if already exists? requirement says creation)
            // Let's check if user exists first
            let user = await this.userRepository.getUserByUsername(username, tx);
            if (!user) {
                user = await this.userRepository.createUser({
                    username,
                    email,
                    password_hash: passwordHash,
                    is_active: true
                }, tx);
            }

            // 5. Create or ensure role admin for this project
            let adminRole = await this.roleRepository.getRoleByNameAndProjectId("admin", project.id, tx);
            if (!adminRole) {
                adminRole = await this.roleRepository.createRole({
                    name: "admin",
                    project_id: project.id
                }, tx);
            }

            // 6. Link user to project with admin role
            await this.projectUserRepository.createProjectUser({
                project_id: project.id,
                user_id: user.id,
                role_id: adminRole.id,
                is_active: true
            }, tx);

            return {
                project: {
                    id: project.id,
                    name: project.name,
                    is_active: project.is_active
                },
                api_key: apiKey,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            };
        });
    }
}
