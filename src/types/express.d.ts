import { AdminKeyEntity } from "../modules/adminKeys/adminKey.repository";
import { ProjectEntity } from "../modules/projects/project.repository";
import { AuthUser } from "../modules/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      adminKey?: AdminKeyEntity;
      project?: ProjectEntity;
      user?: AuthUser;
    }
  }
}

export {};
