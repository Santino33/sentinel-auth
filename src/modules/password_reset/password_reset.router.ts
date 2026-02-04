import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { PasswordResetController } from "./password_reset.controller";
import { PasswordResetService } from "./password_reset.service";

const router = Router();

const passwordResetService = PasswordResetService.create();
const passwordResetController = new PasswordResetController(passwordResetService);

router.post("/forgot-password", asyncHandler((req, res) => 
  passwordResetController.requestReset(req, res)
));

router.post("/reset-password", asyncHandler((req, res) => 
  passwordResetController.resetPassword(req, res)
));

export default router;
