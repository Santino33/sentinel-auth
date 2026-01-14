import { ProjectService } from "./project.service";
import { Request, Response } from "express";

export class ProjectController {
    constructor(private projectService: ProjectService) {}
    
    async createProject(req: Request, res: Response) {
        const project = await this.projectService.createProject(req.body.name);
        return res.status(201).json(project);
    }

    async getProjects(req: Request, res: Response) {
        const projects = await this.projectService.getProjects();
        return res.status(200).json(projects);
    }

    async getProjectById(req: Request, res: Response) {
        const project = await this.projectService.getProjectById(req.params.id);
        return res.status(200).json(project);
    }

    async updateProject(req: Request, res: Response) {
        const project = await this.projectService.updateProject(req.params.id, req.body);
        return res.status(200).json(project);
    }

    async disableProject(req: Request, res: Response) {
        const project = await this.projectService.disableProject(req.params.id);  
        return res.status(200).json(project);
    }

    async enableProject(req: Request, res: Response) {
        const project = await this.projectService.enableProject(req.params.id);
        return res.status(200).json(project);
    }
}