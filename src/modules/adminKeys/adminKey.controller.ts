import { AdminKeyService } from "./adminKey.service";
import { Request, Response } from "express";

export class AdminController{
    constructor(private service: AdminKeyService) {}

    async createKey(req: Request, res: Response) {
        const { key, id } = await this.service.createKey(req.params.admin_key);
        return res.status(201).json({ key, id });
    }

    async validateAdminKey(req: Request, res: Response) {
        const isValid = await this.service.validateKey(req.params.admin_key);
        return res.status(200).json(isValid);
    }

    async disableBootstrapKey(req: Request, res: Response) {
        await this.service.disableBootstrapAdminKey(req.params.admin_key);
        return res.status(200).json('Bootstrap key disabled successfully');
    }

    async disableAdminKey(req: Request, res: Response) {
        const { id } = req.params;
        await this.service.disableAdminKey(id, req.params.admin_key);
        return res.status(200).json('Admin key disabled successfully');
    }

    async enableAdminKey(req: Request, res: Response) {
        const { id } = req.params;
        await this.service.enableAdminKey(id, req.params.admin_key);
        return res.status(200).json('Admin key enabled successfully');
    }
}