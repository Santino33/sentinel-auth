import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { emailVerificationController } from "./emailVerification.module";

const router = Router();

router.post("/request-verification", asyncHandler((req, res) =>
    emailVerificationController.requestVerification(req, res)
));

router.post("/verify-email", asyncHandler((req, res) =>
    emailVerificationController.verifyEmail(req, res)
));

export default router;
