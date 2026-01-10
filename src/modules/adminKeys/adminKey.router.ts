import { Router } from "express";
import { AdminController } from "./adminKey.controller";
import { AdminKeyService } from "./adminKey.service";
import { AdminKeyRepository } from "./adminKey.repository";
import { logger } from "../../utils/logger";

const router = Router();

const adminKeyRepository = new AdminKeyRepository(logger);
const adminKeyService = new AdminKeyService(adminKeyRepository);
const adminControllerInstance = new AdminController(adminKeyService);

router.post("/keys", (req, res) => adminControllerInstance.createKey(req, res));
router.patch("/keys/:id", (req, res) => adminControllerInstance.changeKeyStatus(req, res));

export default router;
