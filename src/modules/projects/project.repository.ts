import { Logger } from "../../utils/logger";
import { prisma } from "../../lib/prisma";
import { isValidUuid } from "../../utils/validation";
import { Prisma } from "@prisma/client";

export type CreateProjectData = {
    name: string;
    api_key: string;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type UpdateProjectData = {
    name?: string;
    updated_at?: Date;
}

export type ProjectEntity = {
    id: string;
    name: string;
    is_active: boolean;
}

export class ProjectRepository {
    constructor(private logger: Logger) {}

    private getClient(tx?: Prisma.TransactionClient) {
        return tx || prisma;
    }

    async createProject(projectData: CreateProjectData, tx?: Prisma.TransactionClient) {
        const project = await this.getClient(tx).projects.create({
            data: projectData,
        });
        if (!project) {
            this.logger.warn("ProjectRepository", "createProject", "No project created");
        } else {
            this.logger.info("ProjectRepository", "createProject", "Project created successfully");
        }
        return project;
    }

    async getProjects(tx?: Prisma.TransactionClient) {
        const projects = await this.getClient(tx).projects.findMany();
        if (!projects || projects.length === 0) {
            this.logger.warn("ProjectRepository", "getProjects", "No projects found");
        } else {
            this.logger.info("ProjectRepository", "getProjects", "Projects retrieved successfully");
        }
        return projects;
    }

    async getProjectByName(name: string, tx?: Prisma.TransactionClient) {
        const project = await this.getClient(tx).projects.findFirst({
            where: {
                name: name,
            },
            select: {
                id: true,
                name: true,
                is_active: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!project) {
            this.logger.warn("ProjectRepository", "getProjectByName", `No project found for the provided name`);
        } else {
            this.logger.info("ProjectRepository", "getProjectByName", "Project retrieved successfully");
        }
        return project;
    }

    async getProjectById(id: string, tx?: Prisma.TransactionClient) {
        if (!isValidUuid(id)) {
            this.logger.warn("ProjectRepository", "getProjectById", `Invalid UUID format provided: ${id}`);
            return null;
        }

        const project = await this.getClient(tx).projects.findFirst({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                is_active: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!project) {
            this.logger.warn("ProjectRepository", "getProjectById", `No project found for the provided ID`);
        } else {
            this.logger.info("ProjectRepository", "getProjectById", "Project retrieved successfully");
        }
        return project;
    }

    async updateProject(id: string, projectData: UpdateProjectData, tx?: Prisma.TransactionClient) {
        if (!isValidUuid(id)) {
            this.logger.warn("ProjectRepository", "updateProject", `Invalid UUID format provided: ${id}`);
            return null;
        }
        const project = await this.getClient(tx).projects.update({
            where: {
                id: id,
            },
            data: projectData,
            select: {
                id: true,
                name: true,
                is_active: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!project) {
            this.logger.warn("ProjectRepository", "updateProject", `No project updated for the provided ID`);
        } else {
            this.logger.info("ProjectRepository", "updateProject", "Project updated successfully");
        }
        return project;
    }

    async disableProject(project_id: string, tx?: Prisma.TransactionClient) {
        if (!isValidUuid(project_id)) {
            this.logger.warn("ProjectRepository", "disableProject", `Invalid UUID format provided: ${project_id}`);
            return null;
        }
        const project = await this.getClient(tx).projects.update({
            where: {
                id: project_id,
            },
            data: {
                is_active: false,
                updated_at: new Date(),
            },
            select: {
                id: true,
                name: true,
                is_active: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!project) {
            this.logger.warn("ProjectRepository", "disableProject", `No project disabled for the provided ID`);
        } else {
            this.logger.info("ProjectRepository", "disableProject", "Project disabled successfully");
        }
        return project;
    }

    async enableProject(project_id: string, tx?: Prisma.TransactionClient) {
        if (!isValidUuid(project_id)) {
            this.logger.warn("ProjectRepository", "enableProject", `Invalid UUID format provided: ${project_id}`);
            return null;
        }
        const project = await this.getClient(tx).projects.update({
            where: {
                id: project_id,
            },
            data: {
                is_active: true,
                updated_at: new Date(),
            },
            select: {
                id: true,
                name: true,
                is_active: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!project) {
            this.logger.warn("ProjectRepository", "enableProject", `No project enabled for the provided ID`);
        } else {
            this.logger.info("ProjectRepository", "enableProject", "Project enabled successfully");
        }
        return project;
    }
}

