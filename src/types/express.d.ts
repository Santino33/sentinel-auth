import { AdminKeyEntity } from "../modules/adminKeys/adminKey.repository";
import { ProjectEntity } from "../modules/projects/project.repository";

declare global {
  namespace Express {
    interface Request {
      adminKey?: AdminKeyEntity;
      project?: ProjectEntity;
    }
  }
}
