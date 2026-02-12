import { UserService } from "./user.service";
import { userRepository, roleRepository, projectUserRepository, refreshTokenRepository } from "../repositories.module";

const userService = new UserService(
    userRepository,
    roleRepository,
    projectUserRepository,
    refreshTokenRepository
);

export { userService };
