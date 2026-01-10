import { AdminKeyService } from "./adminKey.service";
import { Request, Response } from "express";

export class AdminController{
    constructor(private service: AdminKeyService) {}

    async createKey(req: Request, res: Response) {
        const { key, id } = await this.service.createKey();
        return res.status(201).json({ key, id });
    }

    async changeKeyStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { key } = req.body;
        const updatedKey = await this.service.updateAdminKey(id, { key });
        return res.status(200).json({ updatedKey });
    }

    async validateAdminKey(req: Request, res: Response) {
        const { key } = req.body;
        const adminKey = await this.service.getAdminKeyByValue(key);
        const isValid = await this.service.verifyKey(key, adminKey.key);
        return res.status(200).json({ isValid });
    }
}