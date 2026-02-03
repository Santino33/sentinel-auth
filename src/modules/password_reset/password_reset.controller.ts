import { Request, Response } from "express";
import { PasswordResetService } from "./password_reset.service";

export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  async requestReset(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        statusCode: 400,
        errorCode: "BAD_REQUEST",
        message: "Email is required"
      });
      return;
    }

    await this.passwordResetService.requestResetCode(email);

    res.status(200).json({
      message: "If an account exists with that email, a reset code has been sent"
    });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400).json({
        statusCode: 400,
        errorCode: "BAD_REQUEST",
        message: "Email, code, and newPassword are required"
      });
      return;
    }

    await this.passwordResetService.resetPassword(email, code, newPassword);

    res.status(200).json({
      message: "Password has been reset successfully"
    });
  }
}
