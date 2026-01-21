import { Router } from "express";
import { logger } from "../../utils/logger";
import { asyncHandler } from "../../utils/asyncHandler";
import { ProjectRepository } from "./project.repository";
import { ProjectService } from "./project.service";
import { ProjectController } from "./project.controller";
import { requireBody, requireParams } from "../../middleware/validateRequest.middleware";

const router = Router();

const projectRepository = new ProjectRepository(logger);
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);

router.post("/", requireBody, asyncHandler((req, res) => projectController.createProject(req, res)));
router.get("/", asyncHandler((req, res) => projectController.getProjects(req, res)));
router.get("/:id", requireParams, asyncHandler((req, res) => projectController.getProjectById(req, res)));
router.put("/:id", requireParams, asyncHandler((req, res) => projectController.updateProject(req, res)));
router.patch("/disable/:id", requireParams, asyncHandler((req, res) => projectController.disableProject(req, res)));
router.patch("/enable/:id", requireParams, asyncHandler((req, res) => projectController.enableProject(req, res)));

export default router;