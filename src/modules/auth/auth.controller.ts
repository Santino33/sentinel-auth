import { Request, Response } from "express";
import { userService } from "../users/user.module";

export class AuthController {
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

        await userService.changePassword(userId, currentPassword, newPassword);

        res.status(200).json({
            message: "Password changed successfully"
        });
    }
}
