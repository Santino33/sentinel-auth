import { Router } from "express";
import { projectAuth } from "../middleware/projectAuth.middleware";
// Assuming these exist as per modular architecture instructions
// If they don't exist, they should be created in their respective modules
import userRouter from "../modules/users/user.router";
import authRouter from "../modules/auth/auth.router";

const router = Router();

// Apply projectAuth globally to the router
router.use(projectAuth);

// Mount existing routers
router.use("/users", userRouter);
router.use("/auth", authRouter);

export default router;
