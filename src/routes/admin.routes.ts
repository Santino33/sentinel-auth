import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.middleware";
import adminKeyRouter from "../modules/adminKeys/adminKey.router";
import projectRouter from "../modules/projects/project.router";

const router = Router();

// Apply adminAuth globally to the router
router.use(adminAuth);

// Mount existing routers
router.use("/admin-keys", adminKeyRouter);
router.use("/projects", projectRouter);

export default router;
