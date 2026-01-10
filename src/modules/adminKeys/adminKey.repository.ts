import { prisma } from "../../lib/prisma";
import {Logger} from "../../utils/logger";

export type CreateAdminKeyData = {
    key: string;
    is_active?: boolean;
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
        const adminKey = await prisma.admin_keys.findUnique({
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

    async getAdminKey(key: string) {
        const adminKey = await prisma.admin_keys.findUnique({
            where: { key: key },
        });
        if (!adminKey) {
            this.logger.warn("AdminKeyRepository", "getAdminKey", `No admin key found for the provided value`);
        } else {
            this.logger.info("AdminKeyRepository", "getAdminKey", "Admin key retrieved successfully");
        }
    return adminKey;
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

    async updateAdminKey(id: string, adminKeyData: CreateAdminKeyData) {
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
}
