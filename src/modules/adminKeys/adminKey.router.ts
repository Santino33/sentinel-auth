import { Router } from "express";
import { AdminController } from "./adminKey.controller";
import { AdminKeyService } from "./adminKey.service";
import { AdminKeyRepository } from "./adminKey.repository";
import { logger } from "../../utils/logger";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

const adminKeyRepository = new AdminKeyRepository(logger);
const adminKeyService = new AdminKeyService(adminKeyRepository);
const adminControllerInstance = new AdminController(adminKeyService);

router.post("/keys", asyncHandler((req, res) => adminControllerInstance.createKey(req, res)));

router.patch("/disable-bootstrap", asyncHandler((req, res) => adminControllerInstance.disableBootstrapKey(req, res)));
router.patch("/disableAdminKey/:id", asyncHandler((req, res) => adminControllerInstance.disableAdminKey(req, res)));
router.patch("/enableAdminKey/:id", asyncHandler((req, res) => adminControllerInstance.enableAdminKey(req, res)));

router.post("/validate", asyncHandler((req, res) => adminControllerInstance.validateAdminKey(req, res)));


export default router;
