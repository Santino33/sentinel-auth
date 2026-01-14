import { prisma } from "../lib/prisma";

type CreateUserRoleData = {
    user_id: string;
    role_id: string;
}

export class UserRoleRepository {
    async createUserRole(userRoleData: CreateUserRoleData) {
        const userRole = await prisma.user_roles.create({
            data: userRoleData,
        });
        return userRole;
    }

    async getUserRoles() {
        const userRoles = await prisma.user_roles.findMany();
        return userRoles;
    }

    async getUserRolesByUserId(user_id: string) {
        const userRoles = await prisma.user_roles.findMany({
            where: {
                user_id: user_id,
            },
        });
        return userRoles;
    }

    async getUserRolesByRoleId(role_id: string) {
        const userRoles = await prisma.user_roles.findMany({
            where: {
                role_id: role_id,
            },
        });
        return userRoles;
    }

    // Retrieve a user role by its composite unique key (user_id + role_id)
    async getUserRoleByCompositeKey(user_id: string, role_id: string) {
        const userRole = await prisma.user_roles.findUnique({
            where: {
                user_id_role_id: {
                    user_id: user_id,
                    role_id: role_id,
                },
            },
        });
        return userRole;
    }

    // Update a user role using its composite unique key
    async updateUserRoleByCompositeKey(user_id: string, role_id: string, userRoleData: CreateUserRoleData) {
        const userRole = await prisma.user_roles.update({
            where: {
                user_id_role_id: {
                    user_id: user_id,
                    role_id: role_id,
                },
            },
            data: userRoleData,
        });
        return userRole;
    }

    // Delete a user role using its composite unique key
    async deleteUserRoleByCompositeKey(user_id: string, role_id: string) {
        const userRole = await prisma.user_roles.delete({
            where: {
                user_id_role_id: {
                    user_id: user_id,
                    role_id: role_id,
                },
            },
        });
        return userRole;
    }
}
