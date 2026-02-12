import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export type CreateUserData = {
    username: string;
    email?: string;
    password_hash: string;
    is_active?: boolean;
}

export class UserRepository {
    private getClient(tx?: Prisma.TransactionClient) {
        return tx || prisma;
    }

    async createUser(userData: CreateUserData, tx?: Prisma.TransactionClient) {
        const user = await this.getClient(tx).users.create({
            data: userData,
        });
        return user;
    }

    async getUsers(tx?: Prisma.TransactionClient) {
        const users = await this.getClient(tx).users.findMany();
        return users;
    }

    async getUserById(id: string, tx?: Prisma.TransactionClient) {
        const user = await this.getClient(tx).users.findUnique({
            where: {
                id: id,
            },
        });
        return user;
    }

    async getUsersByProjectId(project_id: string, tx?: Prisma.TransactionClient) {
        const users = await this.getClient(tx).users.findMany({
            where: {
                project_users: {
                    some: {
                        project_id: project_id,
                    }
                }
            },
        });
        return users;
    }

    async getUserByUsername(username: string, tx?: Prisma.TransactionClient) {
        const user = await this.getClient(tx).users.findFirst({
            where: {
                username: username,
            },
        });
        return user;
    }

    async getUserByEmail(email: string, tx?: Prisma.TransactionClient) {
        const user = await this.getClient(tx).users.findFirst({
            where: {
                email: email,
            },
        });
        return user;
    }

    async updateUser(id: string, userData: Partial<CreateUserData>, tx?: Prisma.TransactionClient) {
        const user = await this.getClient(tx).users.update({
            where: {
                id: id,
            },
            data: userData,
        });
        return user;
    }

    async deleteUser(id: string, tx?: Prisma.TransactionClient) {
        const user = await this.getClient(tx).users.delete({
            where: {
                id: id,
            },
        });
        return user;
    }

    async getUserByEmailUnverified(email: string, tx?: Prisma.TransactionClient) {
        const user = await this.getClient(tx).users.findFirst({
            where: {
                email: email,
                email_verified: false
            },
        });
        return user;
    }

    async updateVerificationCode(
        id: string,
        code: string,
        expiresAt: Date,
        tx?: Prisma.TransactionClient
    ) {
        const user = await this.getClient(tx).users.update({
            where: { id },
            data: {
                verification_code: code,
                verification_expires_at: expiresAt
            },
        });
        return user;
    }

    async verifyEmail(id: string, tx?: Prisma.TransactionClient) {
        const user = await this.getClient(tx).users.update({
            where: { id },
            data: {
                email_verified: true,
                verification_code: null,
                verification_expires_at: null
            },
        });
        return user;
    }

    async findValidVerificationCode(email: string, code: string, tx?: Prisma.TransactionClient) {
        const user = await this.getClient(tx).users.findFirst({
            where: {
                email: email,
                verification_code: code,
                verification_expires_at: { gt: new Date() },
                email_verified: false
            },
        });
        return user;
    }
}

