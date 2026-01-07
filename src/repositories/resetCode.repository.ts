import { prisma } from "../../lib/prisma";

type CreateResetCodeData = {
    user_id: string;
    code: string;
    expires_at: Date;
    used?: boolean;
}

export class ResetCodeRepository {
    async createResetCode(resetCodeData: CreateResetCodeData) {
        const resetCode = await prisma.password_reset_codes.create({
            data: resetCodeData,
        });
        return resetCode;
    }

    async getResetCodes() {
        const resetCodes = await prisma.password_reset_codes.findMany();
        return resetCodes;
    }

    async getResetCodeById(id: string) {
        const resetCode = await prisma.password_reset_codes.findUnique({
            where: {
                id: id,
            },
        });
        return resetCode;
    }

    async updateResetCode(id: string, resetCodeData: CreateResetCodeData) {
        const resetCode = await prisma.password_reset_codes.update({
            where: {
                id: id,
            },
            data: resetCodeData,
        });
        return resetCode;
    }

    async deleteResetCode(id: string) {
        const resetCode = await prisma.password_reset_codes.delete({
            where: {
                id: id,
            },
        });
        return resetCode;
    }
}
