import { Router } from "express";
import { AdminController } from "../controller/adminController";
import { AdminKeyService } from "../services/adminKey.service";
import { AdminKeyRepository } from "../repositories/adminKey.repository";
import { logger } from "../utils/logger";

const router = Router();

// Inyección de dependencias
const adminKeyRepository = new AdminKeyRepository(logger);
const adminKeyService = new AdminKeyService(adminKeyRepository);
const adminControllerInstance = new AdminController(adminKeyService);

router.post("/keys", (req, res) => adminControllerInstance.createKey(req, res));
router.patch("/keys/:id", (req, res) => adminControllerInstance.changeKeyStatus(req, res));

export default router;
