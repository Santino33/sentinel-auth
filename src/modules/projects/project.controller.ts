import { ProjectService } from "./project.service";
import { ProjectBootstrapService } from "./projectBootstrap.service";
import { Request, Response } from "express";

export class ProjectController {
    constructor(
        private projectService: ProjectService,
        private projectBootstrapService: ProjectBootstrapService
    ) {}
    
    async createProject(req: Request, res: Response) {
        const { name, username, email, password } = req.body;
        
        const project = await this.projectBootstrapService.bootstrapProject({
            projectName: name,
            username: username || "admin", // Defaulting if not provided, but ideally required
            email: email || `${username || 'admin'}@example.com`,
            passwordHash: password || "temp_password_hash", // Ideally hashed before
        });

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
