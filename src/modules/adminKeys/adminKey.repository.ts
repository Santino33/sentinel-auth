import { prisma } from "../../lib/prisma";
import {Logger} from "../../utils/logger";
import { verifyKey } from "../../utils/keyGenerator";
import { isValidUuid } from "../../utils/validation";

export type CreateAdminKeyData = {
    key: string;
    is_active?: boolean;
    is_bootstrap?: boolean;
}

export type AdminKeyEntity = {
    id: string;
    key: string;
    is_active: boolean;
}

export class AdminKeyRepository {
    constructor(private logger: Logger) {}
    async createAdminKey(adminKeyData: CreateAdminKeyData) {
        const adminKey = await prisma.admin_keys.create({
            data: adminKeyData,
            select: {
                id: true,
                key: true,
                is_active: true,
            },
        });
        if (!adminKey) {
            this.logger.warn("AdminKeyRepository", "createAdminKey", `No admin key created for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "createAdminKey", "Admin key created successfully");
        }
        return adminKey;
    }

    async getAdminKeys() {
        const adminKeys = await prisma.admin_keys.findMany({
            select: {
                id: true,
                key: true,
                is_active: true,
            },
        });
        if (!adminKeys) {
            this.logger.warn("AdminKeyRepository", "getAdminKeys", `No admin keys found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "getAdminKeys", "Admin keys retrieved successfully");
        }
        return adminKeys;
    }

    async getAdminKeyById(id: string) {
        if (!id || !isValidUuid(id)) {
            if (id) this.logger.warn("AdminKeyRepository", "getAdminKeyById", `Invalid UUID format provided: ${id}`);
            return null;
        }
        const adminKey = await prisma.admin_keys.findFirst({
            where: {
                id: id,
            },
            select: {
                id: true,
                is_active: true,
            },
        });
        if (!adminKey) {
            this.logger.warn("AdminKeyRepository", "getAdminKeyById", `No admin key found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "getAdminKeyById", "Admin key retrieved successfully");
        }
        return adminKey;
    }



    async getActiveAdminKeysCount() {
        const adminKeysCount = await prisma.admin_keys.count({
            where: {
                is_active: true,
            },
        });
        if (!adminKeysCount) {
            this.logger.warn("AdminKeyRepository", "getActiveAdminKeysCount", `No admin keys found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "getActiveAdminKeysCount", "Admin keys count retrieved successfully");
        }
        return adminKeysCount;
    }

    async deleteAdminKey(id: string) {
        if (!isValidUuid(id)) {
            this.logger.warn("AdminKeyRepository", "deleteAdminKey", `Invalid UUID format provided: ${id}`);
            return null;
        }
        const adminKey = await prisma.admin_keys.delete({
            where: {
                id: id,
            },
        });
        if (!adminKey) {
            this.logger.warn("AdminKeyRepository", "deleteAdminKey", `No admin key found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "deleteAdminKey", "Admin key deleted successfully");
        }
        return adminKey;
    }

    async disableBootstrapAdminKey() {
        const bootstrapKey = await prisma.admin_keys.findFirst({
            where: {
                is_bootstrap: true,
            },
        });

        if (!bootstrapKey) {
            this.logger.warn("AdminKeyRepository", "disableBootstrapAdminKey", "No bootstrap key found");
            return null;
        }

        const adminKey = await prisma.admin_keys.update({
            where: {
                id: bootstrapKey.id,
            },
            data: {
                is_active: false,
            },
            select: {
                id: true,
                is_active: true
            },
        });

        this.logger.info("AdminKeyRepository", "disableBootstrapAdminKey", "Bootstrap admin key disabled successfully");
        return adminKey;
    }

    async updateAdminKey(id: string, adminKeyData: CreateAdminKeyData) {
        if (!id || !isValidUuid(id)) {
            if (id) this.logger.warn("AdminKeyRepository", "updateAdminKey", `Invalid UUID format provided: ${id}`);
            return null;
        }
        const adminKey = await prisma.admin_keys.update({
            where: {
                id: id,
            },
            data: adminKeyData,
            select: {
                id: true,
                is_active: true,
            },
        });
        if (!adminKey) {
            this.logger.warn("AdminKeyRepository", "updateAdminKey", `No admin key found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "updateAdminKey", "Admin key updated successfully");
        }
        return adminKey;
    }
}

