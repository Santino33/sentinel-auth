import { AdminKeyService } from "../services/adminKey.service";
import { Request, Response } from "express";

export class AdminController{
    constructor(private service: AdminKeyService) {}

    async createKey(req: Request, res: Response) {
        const key = await this.service.createKey();
        return res.status(201).json({ key });
    }

    async changeKeyStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { key } = req.body;   
        const updatedKey = await this.service.updateAdminKey(id, { key });
        return res.status(200).json({ updatedKey });
    }
}