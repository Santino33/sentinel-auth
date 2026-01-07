import { prisma } from "../../lib/prisma";


type CreateAdminKeyData = {
    key: string;
    is_active?: boolean;
}

export class AdminKeyRepository {
    async createAdminKey(adminKeyData: CreateAdminKeyData) {
        const adminKey = await prisma.admin_keys.create({
            data: adminKeyData,
        });
        return adminKey;
    }

    async getAdminKeys() {
        const adminKeys = await prisma.admin_keys.findMany();
        return adminKeys;
    }

    async getAdminKeyById(id: string) {
        const adminKey = await prisma.admin_keys.findUnique({
            where: {
                id: id,
            },
        });
        return adminKey;
    }

    async updateAdminKey(id: string, adminKeyData: CreateAdminKeyData) {
        const adminKey = await prisma.admin_keys.update({
            where: {
                id: id,
            },
            data: adminKeyData,
        });
        return adminKey;
    }

    async deleteAdminKey(id: string) {
        const adminKey = await prisma.admin_keys.delete({
            where: {
                id: id,
            },
        });
        return adminKey;
    }
}