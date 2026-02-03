import { Router } from "express";
import { authService } from "./auth.module";
import { authGuard } from "./auth.guard";
import { asyncHandler } from "../../utils/asyncHandler";
import passwordResetRouter from "../password_reset/password_reset.router";

const router = Router();

router.post("/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const projectId = req.project?.id;

    if (!projectId) {
        return res.status(400).json({ error: "Project context is required (x-api-key)" });
    }

    const tokens = await authService.authenticate(email, password, projectId);

    res.status(200).json(tokens);
}));

router.post("/refresh", asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const projectId = req.project?.id;

    if (!projectId) {
        return res.status(400).json({ error: "Project context is required (x-api-key)" });
    }

    const tokens = await authService.refreshToken(refreshToken, projectId);

    res.status(200).json(tokens);
}));

router.get("/me", authGuard, asyncHandler(async (req, res) => {
    res.status(200).json({
        user: req.user,
        project: req.project
    });
}));

router.use("/password-reset", passwordResetRouter);

export default router;
