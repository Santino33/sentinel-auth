import { AdminKeyService } from "./adminKey.service";
import { Request, Response } from "express";

export class AdminController{
    constructor(private service: AdminKeyService) {}
    
    async createKey(req: Request, res: Response) {
        const createdKey = await this.service.createKey();
        return res.status(201).json(createdKey);
    }

    async disableBootstrapKey(req: Request, res: Response) {
        const disabledKey = await this.service.disableBootstrapAdminKey();
        return res.status(200).json(disabledKey);
    }

    async disableAdminKey(req: Request, res: Response) {
        const { id } = req.params;
        const disabledKey = await this.service.disableAdminKey(id);
        return res.status(200).json(disabledKey);
    }

    async enableAdminKey(req: Request, res: Response) {
        const { id } = req.params;
        const enabledKey = await this.service.enableAdminKey(id);
        return res.status(200).json(enabledKey);
    }
}