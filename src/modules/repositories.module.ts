import { UserRepository } from "./users/user.repository";
import { RoleRepository } from "./roles/role.repository";
import { ProjectUserRepository } from "../repositories/projectUser.repository";
import { RefreshTokenRepository } from "./auth/refreshToken.repository";
import { logger } from "../utils/logger";

const userRepository = new UserRepository();
const roleRepository = new RoleRepository(logger);
const projectUserRepository = new ProjectUserRepository();
const refreshTokenRepository = new RefreshTokenRepository();

export {
    userRepository,
    roleRepository,
    projectUserRepository,
    refreshTokenRepository
};
