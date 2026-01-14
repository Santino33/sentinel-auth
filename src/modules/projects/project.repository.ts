import { Logger } from "../../utils/logger";
import { prisma } from "../../lib/prisma";


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

    async createProject(projectData: CreateProjectData) {
        const project = await prisma.projects.create({
            data: projectData,
        });
        if (!project) {
            this.logger.warn("ProjectRepository", "createProject", "No project created");
        } else {
            this.logger.info("ProjectRepository", "createProject", "Project created successfully");
        }
        return project;
    }

    async getProjects() {
        const projects = await prisma.projects.findMany();
        if (!projects || projects.length === 0) {
            this.logger.warn("ProjectRepository", "getProjects", "No projects found");
        } else {
            this.logger.info("ProjectRepository", "getProjects", "Projects retrieved successfully");
        }
        return projects.map(project => ({
            id: project.id,
            name: project.name,
            is_active: project.is_active,
            created_at: project.created_at,
            updated_at: project.updated_at,
        }));
    }

    async getProjectByApiKey(api_key: string) {
        const project = await prisma.projects.findFirst({
            where: {
                api_key: api_key,
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
            this.logger.warn("ProjectRepository", "getProjectByApiKey", `No project found for the provided API key`);
        } else {
            this.logger.info("ProjectRepository", "getProjectByApiKey", "Project retrieved successfully");
        }
        return project;
    }

    async getProjectById(id: string) {
        const project = await prisma.projects.findFirst({
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

    async updateProject(api_key: string, projectData: UpdateProjectData) {
        const project = await prisma.projects.update({
            where: {
                api_key: api_key,
            },
            data: projectData
        });
        if (!project) {
            this.logger.warn("ProjectRepository", "updateProject", `No project updated for the provided API key`);
        } else {
            this.logger.info("ProjectRepository", "updateProject", "Project updated successfully");
        }
        return project;
    }

    async disableProject(project_id: string) {
        const project = await prisma.projects.update({
            where: {
                id: project_id,
            },
            data: {
                is_active: false,
                updated_at: new Date(),
            }
        });
        if (!project) {
            this.logger.warn("ProjectRepository", "disableProject", `No project disabled for the provided ID`);
        } else {
            this.logger.info("ProjectRepository", "disableProject", "Project disabled successfully");
        }
        return project;
    }

    async enableProject(project_id: string) {
        const project = await prisma.projects.update({
            where: {
                id: project_id,
            },
            data: {
                is_active: true,
                updated_at: new Date(),
            }
        });
        if (!project) {
            this.logger.warn("ProjectRepository", "enableProject", `No project enabled for the provided ID`);
        } else {
            this.logger.info("ProjectRepository", "enableProject", "Project enabled successfully");
        }
        return project;
    }
}
