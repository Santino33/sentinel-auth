
import { AdminKeyDisabledError, AdminKeyNotFoundError, AdminKeyAlreadyDisabledError, AdminKeyAlreadyActiveError, NotEnoughAdminKeysError } from "../../errors/AdminKeyError";
import { AdminKeyEntity } from "./adminKey.repository";

/**
 * Asserts that an admin key exists.
 * @throws {AdminKeyNotFoundError}
 */
export function assertAdminKeyExists(adminKey: unknown): asserts adminKey is AdminKeyEntity {
    console.log("Admin key provided to authenticate request:"+adminKey);
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
 * Asserts that an admin key is not already disabled.
 * @throws {AdminKeyAlreadyDisabledError}
 */
export function assertAdminKeyIsNotDisabled(adminKey: AdminKeyEntity): void {
    if (!adminKey.is_active) {
        throw new AdminKeyAlreadyDisabledError();
    }
}

/**
 * Asserts that an admin key is not already active.
 * @throws {AdminKeyAlreadyActiveError}
 */
export function assertAdminKeyIsNotActive(adminKey: AdminKeyEntity): void {
    if (adminKey.is_active) {
        throw new AdminKeyAlreadyActiveError();
    }
}


/**
 * Asserts that an admin key is not able to disable.
 * @throws {NotEnoughAdminKeysError}
 */
export function assertAdminKeyNotAbleToDisable(adminKeysCount: number): void {
    if (adminKeysCount < 2) {
        throw new NotEnoughAdminKeysError();
    }
}


