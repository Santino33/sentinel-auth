import { AdminKeyDisabledError, AdminKeyNotFoundError } from "../../errors/AdminKeyError";
import { AdminKeyEntity } from "../adminKeys/adminKey.repository";
import { ProjectEntity } from "./project.repository";
import { 
  ProjectNotFoundError, 
  ProjectDisabledError, 
  ProjectAlreadyDisabledError, 
  ProjectAlreadyActiveError, 
  ProjectNameRequiredError,
  ProjectNameIsRepeatedError
} from "../../errors/ProjectError";



/**
 * Asserts that a project exists.
 * @throws {ProjectNotFoundError}
 */
export function assertProjectExists(project: unknown): asserts project is ProjectEntity {
  if (!project) {
    throw new ProjectNotFoundError();
  }
}

/**
 * Asserts that a project is active.
 * Used when performing operations that require an active project.
 * @throws {ProjectDisabledError}
 */
export function assertProjectIsActive(project: ProjectEntity): void {
  if (!project.is_active) {
    throw new ProjectDisabledError();
  }
}

/**
 * Asserts that a project is not already disabled.
 * Used before disabling a project.
 * @throws {ProjectAlreadyDisabledError}
 */
export function assertProjectIsNotDisabled(project: ProjectEntity): void {
  if (!project.is_active) {
    throw new ProjectAlreadyDisabledError();
  }
}

/**
 * Asserts that a project is not already active.
 * Used before enabling a project.
 * @throws {ProjectAlreadyActiveError}
 */
export function assertProjectIsNotActive(project: ProjectEntity): void {
  if (project.is_active) {
    throw new ProjectAlreadyActiveError();
  }
}

/**
 * Asserts that an admin key exists.
 * @throws {AdminKeyNotFoundError}
 */
export function assertAdminKeyExists(adminKey: unknown): asserts adminKey is AdminKeyEntity {
    if (!adminKey) {
        throw new AdminKeyNotFoundError();
    }
}

/**
 * Asserts that an admin key is active.
 * @throws {AdminKeyDisabledError}
 */
export function assertAdminKeyIsActive(adminKey: AdminKeyEntity): void {
    if (!adminKey.is_active) {
        throw new AdminKeyDisabledError();
    }
}

/**
 * Asserts that the project name is valid.
 * @param projectName The project name to check
 * @throws {ProjectNameRequiredError}
 */
export function assertProjectName(projectName: string): void {
    if (!projectName || projectName.trim().length === 0) {
        throw new ProjectNameRequiredError();
    }
}


/**
 * Asserts that the project name is not repeated.
 * @param projectName The project name to check
 * @param providedName The provided project name to compare
 * @throws {ProjectNameIsRepeatedError}
 */
export function assertProjectNameIsNotRepeated(projectName: string | undefined, providedName: string): void {
    if (projectName === providedName) {
        throw new ProjectNameIsRepeatedError();
    }
}
