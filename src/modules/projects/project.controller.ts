import { ProjectService } from "./project.service";
import { Request, Response } from "express";

export class ProjectController {
    constructor(private projectService: ProjectService) {}
    
    private getProvidedAdminKey(req: Request): string {
        return (req.headers['x-admin-key'] || req.query.admin_key || req.params.admin_key) as string;
    }

    async createProject(req: Request, res: Response) {
        const project = await this.projectService.createProject(req.body.name, this.getProvidedAdminKey(req));
        return res.status(201).json(project);
    }

    async getProjects(req: Request, res: Response) {
        const projects = await this.projectService.getProjects(this.getProvidedAdminKey(req));
        return res.status(200).json(projects);
    }

    async getProjectByApiKey(req: Request, res: Response) {
        const project = await this.projectService.getProjectByApiKey(req.params.api_key);
        return res.status(200).json(project);
    }

    async updateProject(req: Request, res: Response) {
        const project = await this.projectService.updateProject(req.params.api_key, req.body);
        return res.status(200).json(project);
    }

    async disableProject(req: Request, res: Response) {
        const project = await this.projectService.disableProject(req.params.id, this.getProvidedAdminKey(req));  
        return res.status(200).json(project);
    }

    async enableProject(req: Request, res: Response) {
        const project = await this.projectService.enableProject(req.params.id, this.getProvidedAdminKey(req));
        return res.status(200).json(project);
    }
}