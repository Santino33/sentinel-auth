import { ProjectRepository } from "./project.repository";
import { UserService } from "../users/user.service";
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
    password: string;
}

export class ProjectBootstrapService {
    constructor(
        private projectRepository: ProjectRepository,
        private userService: UserService
    ) {}

    async bootstrapProject(data: BootstrapProjectData) {
        const { projectName, username, email, password } = data;

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

            // 4. Create bootstrap user and link to project (Atomic via UserService)
            const user = await this.userService.ensureBootstrapUser({
                username,
                email,
                password,
                projectId: project.id,
                roleName: "admin"
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
