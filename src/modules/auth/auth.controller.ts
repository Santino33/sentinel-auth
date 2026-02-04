import { Request, Response } from "express";
import { UserService } from "../users/user.service";
import { RoleRepository } from "../roles/role.repository";
import { ProjectUserRepository } from "../../repositories/projectUser.repository";
import { RefreshTokenRepository } from "./refreshToken.repository";
import { UserRepository } from "../users/user.repository";
import { logger } from "../../utils/logger";

export class AuthController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService(
            new UserRepository(),
            new RoleRepository(logger),
            new ProjectUserRepository(),
            new RefreshTokenRepository()
        );
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                statusCode: 401,
                errorCode: "UNAUTHORIZED",
                message: "User not authenticated"
            });
            return;
        }

        if (!currentPassword || !newPassword) {
            res.status(400).json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                message: "Current password and new password are required"
            });
            return;
        }

        try {
            await this.userService.changePassword(userId, currentPassword, newPassword);

            res.status(200).json({
                message: "Password changed successfully"
            });
        } catch (error) {
            throw error;
        }
    }
}
