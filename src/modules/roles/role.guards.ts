import { RoleNameIsRepeatedError, RoleNameRequiredError, RoleNotFoundError, RoleNotCreatedError, RoleNotUpdatedError, RoleNotDeletedError } from "../../errors/RoleError";
import { RoleEntity } from "./role.repository";

export function assertRoleIsNotRepeated(roleName: string | undefined, providedName: string): void {
    if (roleName === providedName) {
        throw new RoleNameIsRepeatedError();
    }
}

export function assertRoleName(roleName: string): void {
    if (!roleName || typeof roleName !== 'string' || roleName.trim().length === 0) {
        throw new RoleNameRequiredError();
    }
}

export function assertRoleExists(role: unknown): asserts role is RoleEntity {
    if (!role) {
        throw new RoleNotFoundError();
    }
}

export function assertRoleCreated(role: unknown): asserts role is RoleEntity {
    if (!role) {
        throw new RoleNotCreatedError();
    }
}

export function assertRoleUpdated(role: unknown): asserts role is RoleEntity {
    if (!role) {
        throw new RoleNotUpdatedError();
    }
}

export function assertRoleDeleted(role: unknown): asserts role is RoleEntity {
    if (!role) {
        throw new RoleNotDeletedError();
    }
}