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
}

