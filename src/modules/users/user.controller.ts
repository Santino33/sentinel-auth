import { Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
    constructor(private userService: UserService) {}

    async createProjectUser(req: Request, res: Response) {
        const { username, email, password, role } = req.body;
        const projectId = req.project?.id;

        if (!projectId) {
            return res.status(400).json({ error: "Project context is required" });
        }

        const user = await this.userService.createProjectUser({
            username,
            email,
            password,
            projectId,
            roleName: role || "USER"
        });

        return res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            projectId: projectId
        });
    }
}
