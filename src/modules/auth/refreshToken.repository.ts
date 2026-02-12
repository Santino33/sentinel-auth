import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export class RefreshTokenRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  async createRefreshToken(data: { user_id: string; token: string; expires_at: Date }, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).refresh_tokens.create({
      data,
    });
  }

  async findByToken(token: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).refresh_tokens.findUnique({
      where: { token },
      include: { users: true }
    });
  }

  async revokeToken(token: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).refresh_tokens.update({
      where: { token },
      data: { revoked: true }
    });
  }

  async deleteByUserId(user_id: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).refresh_tokens.deleteMany({
      where: { user_id }
    });
  }
}
