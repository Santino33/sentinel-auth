import { Router } from "express";
import { authGuard, rolesGuard } from "../auth/auth.guard";
import { asyncHandler } from "../../utils/asyncHandler";
import { UserController } from "./user.controller";
import { userService } from "./user.module";

const router = Router();

const userController = new UserController(userService);

router.post(
    "/",
    authGuard,
    rolesGuard(["ADMIN"]),
    asyncHandler((req, res) => userController.createProjectUser(req, res))
);

export default router;
