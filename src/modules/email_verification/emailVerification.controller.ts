import { Request, Response } from "express";
import { EmailVerificationService } from "./emailVerification.service";
import { assertEmailFormat } from "../password_reset/password_reset.guards";

export class EmailVerificationController {
    constructor(private readonly emailVerificationService: EmailVerificationService) {}

    async requestVerification(req: Request, res: Response): Promise<void> {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                message: "Email is required"
            });
            return;
        }

        try {
            assertEmailFormat(email);
        } catch {
            res.status(400).json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                message: "Invalid email format"
            });
            return;
        }

        await this.emailVerificationService.requestVerification(email);

        res.status(200).json({
            message: "Verification code sent. Check your email."
        });
    }

    async verifyEmail(req: Request, res: Response): Promise<void> {
        const { email, code } = req.body;

        if (!email || !code) {
            res.status(400).json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                message: "Email and code are required"
            });
            return;
        }

        try {
            await this.emailVerificationService.verifyEmail(email, code);

            res.status(200).json({
                message: "Email verified successfully"
            });
        } catch (error: any) {
            if (error.errorCode === "VERIFICATION_CODE_INVALID") {
                res.status(400).json({
                    statusCode: 400,
                    errorCode: "VERIFICATION_CODE_INVALID",
                    message: "Invalid verification code"
                });
                return;
            }
            if (error.errorCode === "VERIFICATION_CODE_EXPIRED") {
                res.status(400).json({
                    statusCode: 400,
                    errorCode: "VERIFICATION_CODE_EXPIRED",
                    message: "Verification code has expired"
                });
                return;
            }
            throw error;
        }
    }
}
