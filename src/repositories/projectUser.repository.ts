import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export type CreateProjectUserData = {
    project_id: string;
    user_id: string;
    role_id: string;
    is_active?: boolean;
}

export class ProjectUserRepository {
    private getClient(tx?: Prisma.TransactionClient) {
        return tx || prisma;
    }

    async createProjectUser(data: CreateProjectUserData, tx?: Prisma.TransactionClient) {
        const projectUser = await this.getClient(tx).project_users.create({
            data,
        });
        return projectUser;
    }

    async getProjectUsers(tx?: Prisma.TransactionClient) {
        const projectUsers = await this.getClient(tx).project_users.findMany({
            include: {
                users: true,
                projects: true,
                roles: true,
            }
        });
        return projectUsers;
    }

    async getProjectUsersByProjectId(project_id: string, tx?: Prisma.TransactionClient) {
        const projectUsers = await this.getClient(tx).project_users.findMany({
            where: { project_id },
            include: { users: true, roles: true }
        });
        return projectUsers;
    }

    async getProjectUsersByUserId(user_id: string, tx?: Prisma.TransactionClient) {
        const projectUsers = await this.getClient(tx).project_users.findMany({
            where: { user_id },
            include: { projects: true, roles: true }
        });
        return projectUsers;
    }

    async updateProjectUser(project_id: string, user_id: string, data: Partial<CreateProjectUserData>, tx?: Prisma.TransactionClient) {
        const projectUser = await this.getClient(tx).project_users.update({
            where: {
                project_id_user_id: {
                    project_id,
                    user_id
                }
            },
            data
        });
        return projectUser;
    }

    async deleteProjectUser(project_id: string, user_id: string, tx?: Prisma.TransactionClient) {
        const projectUser = await this.getClient(tx).project_users.delete({
            where: {
                project_id_user_id: {
                    project_id,
                    user_id
                }
            }
        });
        return projectUser;
    }
}

