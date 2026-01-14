import { AdminKeyService } from "./adminKey.service";
import { Request, Response } from "express";

export class AdminController{
    constructor(private service: AdminKeyService) {}
    
    async createKey(req: Request, res: Response) {
        const { key, id } = await this.service.createKey();
        return res.status(201).json({ key, id });
    }

    async disableBootstrapKey(req: Request, res: Response) {
        await this.service.disableBootstrapAdminKey();
        return res.status(200).json('Bootstrap key disabled successfully');
    }

    async disableAdminKey(req: Request, res: Response) {
        const { id } = req.params;
        await this.service.disableAdminKey(id);
        return res.status(200).json('Admin key disabled successfully');
    }

    async enableAdminKey(req: Request, res: Response) {
        const { id } = req.params;
        await this.service.enableAdminKey(id);
        return res.status(200).json('Admin key enabled successfully');
    }
}