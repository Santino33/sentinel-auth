import { UserRepository } from "./user.repository";
import { RoleRepository } from "../roles/role.repository";
import { ProjectUserRepository } from "../../repositories/projectUser.repository";
import { Prisma } from "@prisma/client";
import { generateHash } from "../../utils/keyGenerator";
import { assertUserDoesNotExists } from "./user.guards";
import { RoleNotFoundError } from "../../errors/RoleError";

export interface CreateProjectUserData {
    username: string;
    email: string;
    password: string;
    projectId: string;
    roleName: string;
}

export class UserService {
    constructor(
        private userRepository: UserRepository,
        private roleRepository: RoleRepository,
        private projectUserRepository: ProjectUserRepository
    ) {}

    /**
     * Creates a user, secures their password, and links them to a project with a specific role.
     * Designed to be atomic (works within a transaction if provided).
     */
    async createProjectUser(data: CreateProjectUserData, tx?: Prisma.TransactionClient) {
        const { username, email, password, projectId, roleName } = data;

        // 1. Check if user already exists
        // Note: In some cases (bootstrap), the user might already exist, 
        // but for a clean creation via API, we should validate.
        const existingUser = await this.userRepository.getUserByUsername(username, tx);
        assertUserDoesNotExists(existingUser, username);

        // 2. Hash password
        const passwordHash = await generateHash(password);

        // 3. Create User
        const user = await this.userRepository.createUser({
            username,
            email,
            password_hash: passwordHash,
            is_active: true
        }, tx);

        // 4. Find or Create Role inside the project
        let role = await this.roleRepository.getRoleByNameAndProjectId(roleName, projectId, tx);
        
        if (!role) {
            // In a project context, usually roles should exist, 
            // but for flexible onboarding we might create it if it's the 'admin' role.
            if (roleName === 'admin' || roleName === 'ADMIN') {
                role = await this.roleRepository.createRole({
                    name: 'ADMIN',
                    project_id: projectId
                }, tx);
            } else {
                throw new RoleNotFoundError(`Role '${roleName}' not found in project`);
            }
        }

        // 5. Link User to Project
        await this.projectUserRepository.createProjectUser({
            project_id: projectId,
            user_id: user.id,
            role_id: role.id,
            is_active: true
        }, tx);

        return user;
    }

    /**
     * Specialized method for bootstrapping that handles "Upsert" logic
     */
    async ensureBootstrapUser(data: CreateProjectUserData, tx: Prisma.TransactionClient) {
        const { username, email, password, projectId, roleName } = data;

        let user = await this.userRepository.getUserByUsername(username, tx);
        
        if (!user) {
            const passwordHash = await generateHash(password);
            user = await this.userRepository.createUser({
                username,
                email,
                password_hash: passwordHash,
                is_active: true
            }, tx);
        }

        let role = await this.roleRepository.getRoleByNameAndProjectId(roleName, projectId, tx);
        if (!role) {
            role = await this.roleRepository.createRole({
                name: roleName,
                project_id: projectId
            }, tx);
        }

        await this.projectUserRepository.createProjectUser({
            project_id: projectId,
            user_id: user.id,
            role_id: role.id,
            is_active: true
        }, tx);

        return user;
    }
}
