import { Router } from "express";
import { RoleController } from "./role.controller";
import { RoleService } from "./role.service";
import { RoleRepository } from "./role.repository";
import { requireBody, requireParams } from "../../middleware/validateRequest.middleware";
import { logger } from "../../utils/logger";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();
const roleRepository = new RoleRepository(logger);
const roleService = new RoleService(roleRepository);
const roleController = new RoleController(roleService);

router.post("/", requireBody, asyncHandler((req, res) => roleController.createRole(req, res)));
router.get("/", asyncHandler((req, res) => roleController.getRoles(req, res)));
router.get("/:id", requireParams, asyncHandler((req, res) => roleController.getRoleById(req, res)));
router.put("/:id", requireParams, asyncHandler((req, res) => roleController.updateRole(req, res)));

export default router;