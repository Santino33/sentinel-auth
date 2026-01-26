import { prisma } from "../lib/prisma";

export type CreateProjectUserData = {
    project_id: string;
    user_id: string;
    role_id: string;
    is_active?: boolean;
}

export class ProjectUserRepository {
    async createProjectUser(data: CreateProjectUserData) {
        const projectUser = await prisma.project_users.create({
            data,
        });
        return projectUser;
    }

    async getProjectUsers() {
        const projectUsers = await prisma.project_users.findMany({
            include: {
                users: true,
                projects: true,
                roles: true,
            }
        });
        return projectUsers;
    }

    async getProjectUsersByProjectId(project_id: string) {
        const projectUsers = await prisma.project_users.findMany({
            where: { project_id },
            include: { users: true, roles: true }
        });
        return projectUsers;
    }

    async getProjectUsersByUserId(user_id: string) {
        const projectUsers = await prisma.project_users.findMany({
            where: { user_id },
            include: { projects: true, roles: true }
        });
        return projectUsers;
    }

    async updateProjectUser(project_id: string, user_id: string, data: Partial<CreateProjectUserData>) {
        const projectUser = await prisma.project_users.update({
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

    async deleteProjectUser(project_id: string, user_id: string) {
        const projectUser = await prisma.project_users.delete({
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
