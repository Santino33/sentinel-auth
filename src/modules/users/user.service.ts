import { UserRepository } from "./user.repository";
import { RoleRepository } from "../roles/role.repository";
import { ProjectUserRepository } from "../../repositories/projectUser.repository";
import { RefreshTokenRepository } from "../auth/refreshToken.repository";
import { Prisma, users } from "@prisma/client";
import { generateHash } from "../../utils/keyGenerator";
import { prisma } from "../../lib/prisma";
import { assertUserDoesNotExists, assertEmailIsUnique } from "./user.guards";
import { assertCurrentPassword, assertNewPasswordDifferent, assertPasswordStrength } from "../../guards/password.guards";
import { UserNotFoundError } from "../../errors/UserError";
import { RoleNotFoundError } from "../../errors/RoleError";
import crypto from "crypto";
import { EmailService, NodemailerEmailService } from "../../lib/email.service";

export interface CreateProjectUserData {
    username: string;
    email: string;
    password: string;
    projectId: string;
    roleName: string;
}

export class UserService {
    private readonly VERIFICATION_CODE_EXPIRY_HOURS = 24;
    private readonly emailService: EmailService;

    constructor(
        private userRepository: UserRepository,
        private roleRepository: RoleRepository,
        private projectUserRepository: ProjectUserRepository,
        private refreshTokenRepository: RefreshTokenRepository
    ) {
        if (process.env.SMTP_HOST) {
            this.emailService = new NodemailerEmailService();
        } else {
            this.emailService = {
                async sendPasswordResetEmail(): Promise<void> {},
                async sendVerificationEmail(email: string, code: string): Promise<void> {
                    console.log(`[MOCK EMAIL] Verification - To: ${email} | Code: ${code}`);
                }
            } as EmailService;
        }
    }

    private generateVerificationCode(): string {
        return crypto.randomInt(10000000, 99999999).toString();
    }

    private async createVerificationForUser(user: users, tx?: Prisma.TransactionClient) {
        if (!user.email) {
            return;
        }

        const code = this.generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + this.VERIFICATION_CODE_EXPIRY_HOURS);

        await this.userRepository.updateVerificationCode(user.id, code, expiresAt, tx);

        await this.emailService.sendVerificationEmail(user.email, code, this.VERIFICATION_CODE_EXPIRY_HOURS);
    }

    /**
     * Creates a user, secures their password, and links them to a project with a specific role.
     * Designed to be atomic (works within a transaction if provided).
     */
    async createProjectUser(data: CreateProjectUserData, tx?: Prisma.TransactionClient) {
        const { username, email, password, projectId, roleName } = data;

        // 1. Check if user already exists
        const existingUserByName = await this.userRepository.getUserByUsername(username, tx);
        assertUserDoesNotExists(existingUserByName, username);

        const existingUserByEmail = await this.userRepository.getUserByEmail(email, tx);
        assertEmailIsUnique(existingUserByEmail, email);

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

        // 6. Generate verification code and send email
        await this.createVerificationForUser(user, tx);

        return user;
    }

    /**
     * Specialized method for bootstrapping that handles "Upsert" logic
     */
    async ensureBootstrapUser(data: CreateProjectUserData, tx: Prisma.TransactionClient) {
        const { username, email, password, projectId, roleName } = data;

        let user = await this.userRepository.getUserByUsername(username, tx);
        
        if (!user) {
            // Also check by email to avoid unique constraint violations
            const existingByEmail = await this.userRepository.getUserByEmail(email, tx);
            if (existingByEmail) {
                user = existingByEmail;
            } else {
                const passwordHash = await generateHash(password);
                user = await this.userRepository.createUser({
                    username,
                    email,
                    password_hash: passwordHash,
                    is_active: true
                }, tx);

                await this.createVerificationForUser(user, tx);
            }
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

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new UserNotFoundError(`User with id '${userId}' not found`);
        }

        await assertCurrentPassword(currentPassword, user.password_hash);
        assertNewPasswordDifferent(currentPassword, newPassword);
        assertPasswordStrength(newPassword);

        const newPasswordHash = await generateHash(newPassword);

        await prisma.$transaction(async (tx) => {
            await this.userRepository.updateUser(userId, { password_hash: newPasswordHash }, tx);
            await this.refreshTokenRepository.deleteByUserId(userId, tx);
        });
    }
}
