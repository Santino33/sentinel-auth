import { Request, Response } from "express";
import { RoleService } from "./role.service";

export class RoleController {
    constructor(private roleService: RoleService) {}

    async createRole(req: Request, res: Response) {
        const projectId = (req as any).project?.id;
        const role = await this.roleService.createRole({ ...req.body, project_id: projectId });
        return res.status(201).json(role);
    }

    async getRoles(req: Request, res: Response) {
        const roles = await this.roleService.getRolesByProjectId((req as any).project?.id);
        return res.status(200).json(roles);
    }

    async getRoleById(req: Request, res: Response) {
        const role = await this.roleService.getRoleById(req.params.id, (req as any).project?.id);
        return res.status(200).json(role);
    }

    async updateRole(req: Request, res: Response) {
        const role = await this.roleService.updateRole(req.params.id, req.body, (req as any).project?.id);
        return res.status(200).json(role);
    }

    async deleteRole(req: Request, res: Response) {
        const role = await this.roleService.deleteRole(req.params.id, (req as any).project?.id);
        return res.status(200).json(role);
    }
}