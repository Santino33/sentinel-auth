import { Logger } from "src/utils/logger";
import { prisma } from "../../lib/prisma";


export type CreateProjectData = {
    name: string;
    api_key: string;
    is_active?: boolean;
}

export class ProjectRepository {
    constructor(private logger: Logger) {}

    async createProject(projectData: CreateProjectData) {
        const project = await prisma.projects.create({
            data: projectData,
        });
        return project;
    }

    async getProjects() {
        const projects = await prisma.projects.findMany();
        return projects.map(project => ({
            id: project.id,
            name: project.name,
            is_active: project.is_active,
            created_at: project.created_at,
            updated_at: project.updated_at,
        }));
    }

    async getProjectByApiKey(api_key: string) {
        const project = await prisma.projects.findUnique({
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
        return project;
    }

    async updateProject(id: string, projectData: CreateProjectData) {
        const project = await prisma.projects.update({
            where: {
                id: id,
            },
            data: projectData,
        });
        return project;
    }

    async deleteProject(id: string) {
        const project = await prisma.projects.delete({
            where: {
                id: id,
            },
        });
        return project;
    }
}
