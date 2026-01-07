import { prisma } from "../../lib/prisma";

type CreateRefreshTokenData = {
    user_id: string;
    token: string;
    expires_at: Date;
    revoked?: boolean;
}

export class RefreshTokenRepository {
    async createRefreshToken(refreshTokenData: CreateRefreshTokenData) {
        const refreshToken = await prisma.refresh_tokens.create({
            data: refreshTokenData,
        });
        return refreshToken;
    }

    async getRefreshTokens() {
        const refreshTokens = await prisma.refresh_tokens.findMany();
        return refreshTokens;
    }

    async getRefreshTokenById(id: string) {
        const refreshToken = await prisma.refresh_tokens.findUnique({
            where: {
                id: id,
            },
        });
        return refreshToken;
    }

    async updateRefreshToken(id: string, refreshTokenData: CreateRefreshTokenData) {
        const refreshToken = await prisma.refresh_tokens.update({
            where: {
                id: id,
            },
            data: refreshTokenData,
        });
        return refreshToken;
    }

    async deleteRefreshToken(id: string) {
        const refreshToken = await prisma.refresh_tokens.delete({
            where: {
                id: id,
            },
        });
        return refreshToken;
    }
}
