import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

type CreateResetCodeData = {
  user_id: string;
  code: string;
  expires_at: Date;
  used?: boolean;
}

export class ResetCodeRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  async createResetCode(resetCodeData: CreateResetCodeData, tx?: Prisma.TransactionClient) {
    const resetCode = await this.getClient(tx).password_reset_codes.create({
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
      where: { id },
    });
    return resetCode;
  }

  async updateResetCode(id: string, resetCodeData: CreateResetCodeData, tx?: Prisma.TransactionClient) {
    const resetCode = await this.getClient(tx).password_reset_codes.update({
      where: { id },
      data: resetCodeData,
    });
    return resetCode;
  }

  async deleteResetCode(id: string, tx?: Prisma.TransactionClient) {
    const resetCode = await this.getClient(tx).password_reset_codes.delete({
      where: { id },
    });
    return resetCode;
  }

  async findValidCode(userId: string, code: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).password_reset_codes.findFirst({
      where: {
        user_id: userId,
        code: code,
        used: false,
        expires_at: { gt: new Date() }
      }
    });
  }

  async markAsUsed(id: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).password_reset_codes.update({
      where: { id },
      data: { used: true }
    });
  }

  async deleteByUserId(userId: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).password_reset_codes.deleteMany({
      where: { user_id: userId }
    });
  }

  async deleteExpiredCodes(tx?: Prisma.TransactionClient) {
    return this.getClient(tx).password_reset_codes.deleteMany({
      where: {
        used: false,
        expires_at: { lt: new Date() }
      }
    });
  }
}
