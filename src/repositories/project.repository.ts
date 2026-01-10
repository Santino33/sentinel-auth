import { prisma } from "../lib/prisma";


type CreateProjectData = {
    name: string;
    api_key: string;
    is_active?: boolean;
}

export class ProjectRepository {
    async createProject(projectData: CreateProjectData) {
        const project = await prisma.projects.create({
            data: projectData,
        });
        return project;
    }

    async getProjects() {
        const projects = await prisma.projects.findMany();
        return projects;
    }

    async getProjectById(id: string) {
        const project = await prisma.projects.findUnique({
            where: {
                id: id,
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
