import crypto from "crypto";
import { ResetCodeRepository } from "./resetCode.repository";
import { UserRepository } from "../../modules/users/user.repository";
import { RefreshTokenRepository } from "../../modules/auth/refreshToken.repository";
import { EmailService, NodemailerEmailService } from "../../lib/email.service";
import { prisma } from "../../lib/prisma";
import { generateHash } from "../../utils/keyGenerator";
import { assertResetCode, assertPasswordStrength, assertResetCodeExists, assertResetCodeNotUsed, assertResetCodeNotExpired } from "./password_reset.guards";
import { ResetUserNotFoundError } from "../../errors/ResetError";

export class PasswordResetService {
  private readonly RESET_CODE_EXPIRY_HOURS = 1;

  constructor(
    private readonly resetCodeRepository: ResetCodeRepository,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly emailService: EmailService
  ) {}

  static create(): PasswordResetService {
    const resetCodeRepository = new ResetCodeRepository();
    const userRepository = new UserRepository();
    const refreshTokenRepository = new RefreshTokenRepository();
    let emailService: EmailService;

    if (process.env.SMTP_HOST) {
      emailService = new NodemailerEmailService();
    } else {
      emailService = {
        async sendPasswordResetEmail(email: string, code: string): Promise<void> {
          console.log(`[MOCK EMAIL] To: ${email} | Code: ${code}`);
        },
        async sendVerificationEmail(): Promise<void> {}
      };
    }

    return new PasswordResetService(
      resetCodeRepository,
      userRepository,
      refreshTokenRepository,
      emailService
    );
  }

  async requestResetCode(email: string): Promise<void> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      return;
    }

    await this.resetCodeRepository.deleteByUserId(user.id);

    const code = this.generateResetCode();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.RESET_CODE_EXPIRY_HOURS);

    await this.resetCodeRepository.createResetCode({
      user_id: user.id,
      code: code,
      expires_at: expiresAt
    });

    await this.emailService.sendPasswordResetEmail(email, code, this.RESET_CODE_EXPIRY_HOURS);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    assertResetCode(code);

    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new ResetUserNotFoundError();
    }

    const resetCode = await this.resetCodeRepository.findValidCode(user.id, code);
    assertResetCodeExists(resetCode);
    assertResetCodeNotUsed(resetCode);
    assertResetCodeNotExpired(resetCode);

    assertPasswordStrength(newPassword);

    const passwordHash = await generateHash(newPassword);

    await prisma.$transaction(async (tx) => {
      await this.userRepository.updateUser(user.id, { password_hash: passwordHash }, tx);
      await this.resetCodeRepository.markAsUsed(resetCode.id, tx);
    });

    await this.refreshTokenRepository.deleteByUserId(user.id);
  }

  private generateResetCode(): string {
    return crypto.randomInt(10000000, 99999999).toString();
  }
}
