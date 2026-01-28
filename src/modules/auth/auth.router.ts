import { Router } from "express";
import { authService } from "./auth.module";
import { authGuard } from "./auth.guard";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Endpoint for user login
router.post("/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // TODO: Validate user credentials with UserService
    // For now, this is a placeholder demonstration
    const dummyUser = {
        id: "user-uuid-123",
        email: email || "admin@example.com",
        password: password || "admin",
        role: "ADMIN",
        projectId: req.project?.id // If under /api, project is already attached by projectAuth
    };

    const tokens = await authService.login(dummyUser);

    res.status(200).json(tokens);
}));

// Placeholder for profile
router.get("/me", authGuard, asyncHandler(async (req, res) => {
    res.status(200).json({
        user: req.user,
        project: req.project
    });
}));

export default router;
