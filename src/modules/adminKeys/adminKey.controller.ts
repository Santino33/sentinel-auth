import { AdminKeyService } from "./adminKey.service";
import { Request, Response } from "express";

export class AdminController{
    constructor(private service: AdminKeyService) {}
    
    private getProvidedKey(req: Request): string {
        return (req.headers['x-admin-key'] || req.query.admin_key || req.params.admin_key) as string;
    }

    async createKey(req: Request, res: Response) {
        const { key, id } = await this.service.createKey(this.getProvidedKey(req));
        return res.status(201).json({ key, id });
    }

    async validateAdminKey(req: Request, res: Response) {
        const isValid = await this.service.validateKey(this.getProvidedKey(req));
        return res.status(200).json(isValid);
    }

    async disableBootstrapKey(req: Request, res: Response) {
        await this.service.disableBootstrapAdminKey(this.getProvidedKey(req));
        return res.status(200).json('Bootstrap key disabled successfully');
    }

    async disableAdminKey(req: Request, res: Response) {
        const { id } = req.params;
        await this.service.disableAdminKey(id, this.getProvidedKey(req));
        return res.status(200).json('Admin key disabled successfully');
    }

    async enableAdminKey(req: Request, res: Response) {
        const { id } = req.params;
        await this.service.enableAdminKey(id, this.getProvidedKey(req));
        return res.status(200).json('Admin key enabled successfully');
    }
}