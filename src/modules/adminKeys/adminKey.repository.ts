import { prisma } from "../../lib/prisma";
import {Logger} from "../../utils/logger";
import { verifyKey } from "../../utils/keyGenerator";

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
        });
        if (!adminKey) {
            this.logger.warn("AdminKeyRepository", "createAdminKey", `No admin key created for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "createAdminKey", "Admin key created successfully");
        }
        return adminKey;
    }

    async getAdminKeys() {
        const adminKeys = await prisma.admin_keys.findMany();
        if (!adminKeys) {
            this.logger.warn("AdminKeyRepository", "getAdminKeys", `No admin keys found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "getAdminKeys", "Admin keys retrieved successfully");
        }
        return adminKeys;
    }

    async getAdminKeyById(id: string) {
        if (!id) return null;
        const adminKey = await prisma.admin_keys.findFirst({
            where: {
                id: id,
            },
        });
        if (!adminKey) {
            this.logger.warn("AdminKeyRepository", "getAdminKeyById", `No admin key found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "getAdminKeyById", "Admin key retrieved successfully");
        }
        return adminKey;
    }

    async getAdminKeybyKey(key: string) {
        if (!key) return null;
        const adminKey = await prisma.admin_keys.findFirst({
            where: { key: key },
            select: {
                id: true,
                key: true,
                is_active: true,
            }
        });
        if (!adminKey) {
            this.logger.warn("AdminKeyRepository", "getAdminKeybyKey", `No admin key found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "getAdminKeybyKey", "Admin key retrieved successfully");
        }
        return adminKey as AdminKeyEntity;
    }

    async getAdminKey(key: string) {
        if (!key) return null;
        const adminKey = await prisma.admin_keys.findFirst({
            where: { key: key },
        });
        if (!adminKey) {
            this.logger.warn("AdminKeyRepository", "getAdminKey", `No admin key found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "getAdminKey", "Admin key retrieved successfully");
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
        });

        this.logger.info("AdminKeyRepository", "disableBootstrapAdminKey", "Bootstrap admin key disabled successfully");
        return adminKey;
    }

    async updateAdminKey(id: string, adminKeyData: CreateAdminKeyData) {
        if (!id) return null;
        const adminKey = await prisma.admin_keys.update({
            where: {
                id: id,
            },
            data: adminKeyData,
        });
        if (!adminKey) {
            this.logger.warn("AdminKeyRepository", "updateAdminKey", `No admin key found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "updateAdminKey", "Admin key updated successfully");
        }
        return adminKey;
    }

    async validateKey(providedKey: string): Promise<boolean> {
        if (!providedKey) return false;
        const activeKeys = await this.getAdminKeys();
        for (const adminKey of activeKeys) {
            if (adminKey.is_active && adminKey.key) {
                const match = await verifyKey(providedKey, adminKey.key);
                if (match) return true;
            }
        }
        return false;
    }
}

