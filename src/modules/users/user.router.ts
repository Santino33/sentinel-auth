import { Router } from "express";
import { authGuard, rolesGuard } from "../auth/auth.guard";
import { asyncHandler } from "../../utils/asyncHandler";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { RoleRepository } from "../roles/role.repository";
import { ProjectUserRepository } from "../../repositories/projectUser.repository";
import { logger } from "../../utils/logger";

const router = Router();

// Repositories
const userRepository = new UserRepository();
const roleRepository = new RoleRepository(logger);
const projectUserRepository = new ProjectUserRepository();

// Services
const userService = new UserService(userRepository, roleRepository, projectUserRepository);

// Controller
const userController = new UserController(userService);

/**
 * Create a new user in the current project context
 */
router.post(
    "/", 
    authGuard, 
    rolesGuard(["ADMIN"]), 
    asyncHandler((req, res) => userController.createProjectUser(req, res))
);

export default router;
