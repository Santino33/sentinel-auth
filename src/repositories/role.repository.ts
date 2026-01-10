import { prisma } from "../lib/prisma";

type CreateRoleData = {
    project_id: string;
    name: string;
}

export class RoleRepository {
    async createRole(roleData: CreateRoleData) {
        const role = await prisma.roles.create({
            data: roleData,
        });
        return role;
    }

    async getRoles() {
        const roles = await prisma.roles.findMany();
        return roles;
    }

    async getRoleById(id: string) {
        const role = await prisma.roles.findUnique({
            where: {
                id: id,
            },
        });
        return role;
    }

    async updateRole(id: string, roleData: CreateRoleData) {
        const role = await prisma.roles.update({
            where: {
                id: id,
            },
            data: roleData,
        });
        return role;
    }

    async deleteRole(id: string) {
        const role = await prisma.roles.delete({
            where: {
                id: id,
            },
        });
        return role;
    }
}
