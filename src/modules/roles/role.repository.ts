import { Logger } from "../../utils/logger";
import { prisma } from "../../lib/prisma";
import { isValidUuid } from "../../utils/validation";

export type RoleEntity = {
    id: string;
    name: string;
    project_id: string;
}

export type CreateRoleData = {
    name: string;
    project_id: string;
}

export type UpdateRoleData = {
    name: string;
}

export class RoleRepository {
    constructor(private logger: Logger) {}

    async createRole(roleData: CreateRoleData) {
        const role = await prisma.roles.create({
            data: roleData,
        });
        if (!role) {
            this.logger.warn("RoleRepository", "createRole", "No role created");
        } else {
            this.logger.info("RoleRepository", "createRole", "Role created successfully");
        }
        return role;
    }

    async getRoles() {
        const roles = await prisma.roles.findMany();
        if (!roles || roles.length === 0) {
            this.logger.warn("RoleRepository", "getRoles", "No roles found");
        } else {
            this.logger.info("RoleRepository", "getRoles", "Roles retrieved successfully");
        }
        return roles;
    }

    async getRoleById(id: string) {
        if (!isValidUuid(id)) {
            this.logger.warn("RoleRepository", "getRoleById", `Invalid UUID format provided: ${id}`);
            return null;
        }
        const role = await prisma.roles.findFirst({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                project_id: true,
            },
        });
        if (!role) {
            this.logger.warn("RoleRepository", "getRoleById", `No role found for the provided ID`);
        } else {
            this.logger.info("RoleRepository", "getRoleById", "Role retrieved successfully");
        }
        return role;
    }

    async getRoleByName(name: string) {
        const role = await prisma.roles.findFirst({
            where: {
                name: name,
            },
            select: {
                id: true,
                name: true,
                project_id: true,
            },
        });
        if (!role) {
            this.logger.warn("RoleRepository", "getRoleByName", `No role found for the provided name`);
        } else {
            this.logger.info("RoleRepository", "getRoleByName", "Role retrieved successfully");
        }
        return role;
    }

    async getRolesByProjectId(projectId: string) {
        const roles = await prisma.roles.findMany({
            where: {
                project_id: projectId,
            },
            select: {
                id: true,
                name: true,
                project_id: true,
            },
        });
        if (!roles || roles.length === 0) {
            this.logger.warn("RoleRepository", "getRolesByProjectId", `No roles found for the provided project ID`);
        } else {
            this.logger.info("RoleRepository", "getRolesByProjectId", "Roles retrieved successfully");
        }
        return roles;
    }

    async getRolesByIdAndProjectId(id: string, projectId: string) {
        const role = await prisma.roles.findFirst({
            where: {
                id: id,
                project_id: projectId,
            },
            select: {
                id: true,
                name: true,
                project_id: true,
            },
        });
        if (!role) {
            this.logger.warn("RoleRepository", "getRolesByIdAndProjectId", `No role found for the provided ID and project ID`);
        } else {
            this.logger.info("RoleRepository", "getRolesByIdAndProjectId", "Role retrieved successfully");
        }
        return role;
    }

    async updateRole(id: string, roleData: UpdateRoleData) {
        if (!isValidUuid(id)) {
            this.logger.warn("RoleRepository", "updateRole", `Invalid UUID format provided: ${id}`);
            return null;
        }
        const role = await prisma.roles.update({
            where: {
                id: id,
            },
            data: roleData,
            select: {
                id: true,
                name: true,
                project_id: true,
            },
        });
        if (!role) {
            this.logger.warn("RoleRepository", "updateRole", `No role updated for the provided ID`);
        } else {
            this.logger.info("RoleRepository", "updateRole", "Role updated successfully");
        }
        return role;
    }

    async deleteRole(id: string) {
        if (!isValidUuid(id)) {
            this.logger.warn("RoleRepository", "deleteRole", `Invalid UUID format provided: ${id}`);
            return null;
        }
        const role = await prisma.roles.delete({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                project_id: true,
            },
        });
        if (!role) {
            this.logger.warn("RoleRepository", "deleteRole", `No role deleted for the provided ID`);
        } else {
            this.logger.info("RoleRepository", "deleteRole", "Role deleted successfully");
        }
        return role;
    }
}