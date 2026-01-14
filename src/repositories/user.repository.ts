import { prisma } from "../lib/prisma";

type CreateUserData = {
    project_id: string;
    username: string;
    email?: string;
    password_hash: string;
    salt: string;
    is_active?: boolean;
}

export class UserRepository {
    async createUser(userData: CreateUserData) {
        const user = await prisma.users.create({
            data: userData,
        });
        return user;
    }

    async getUsers() {
        const users = await prisma.users.findMany();
        return users;
    }

    async getUserById(id: string) {
        const user = await prisma.users.findUnique({
            where: {
                id: id,
            },
        });
        return user;
    }

    async getUsersByProjectId(project_id: string) {
        const users = await prisma.users.findMany({
            where: {
                project_id: project_id,
            },
        });
        return users;
    }

    async updateUser(id: string, userData: CreateUserData) {
        const user = await prisma.users.update({
            where: {
                id: id,
            },
            data: userData,
        });
        return user;
    }

    async deleteUser(id: string) {
        const user = await prisma.users.delete({
            where: {
                id: id,
            },
        });
        return user;
    }
}
