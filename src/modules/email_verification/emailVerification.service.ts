import crypto from "crypto";
import { UserRepository } from "../users/user.repository";
import { EmailService, NodemailerEmailService } from "../../lib/email.service";
import { prisma } from "../../lib/prisma";
import { generateVerificationCode } from "./emailVerification.guards";
import { assertEmailFormat } from "../password_reset/password_reset.guards";
import { VerificationCodeInvalidError, VerificationCodeExpiredError } from "../../errors/UserError";

export class EmailVerificationService {
    private readonly VERIFICATION_CODE_EXPIRY_HOURS = 24;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailService: EmailService
    ) {}

    static create(): EmailVerificationService {
        const userRepository = new UserRepository();
        let emailService: EmailService;

        if (process.env.SMTP_HOST) {
            emailService = new NodemailerEmailService();
        } else {
            emailService = {
                async sendPasswordResetEmail(): Promise<void> {},
                async sendVerificationEmail(email: string, code: string): Promise<void> {
                    console.log(`[MOCK EMAIL] Verification - To: ${email} | Code: ${code}`);
                }
            };
        }

        return new EmailVerificationService(userRepository, emailService);
    }

    async requestVerification(email: string): Promise<void> {
        assertEmailFormat(email);

        const user = await this.userRepository.getUserByEmail(email);

        if (!user) {
            return;
        }

        if (user.email_verified) {
            return;
        }

        const code = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + this.VERIFICATION_CODE_EXPIRY_HOURS);

        await this.userRepository.updateVerificationCode(user.id, code, expiresAt);

        await this.emailService.sendVerificationEmail(email, code, this.VERIFICATION_CODE_EXPIRY_HOURS);
    }

    async verifyEmail(email: string, code: string): Promise<void> {
        assertEmailFormat(email);

        if (!code || typeof code !== 'string' || code.length !== 8 || !/^\d+$/.test(code)) {
            throw new VerificationCodeInvalidError();
        }

        const user = await this.userRepository.findValidVerificationCode(email, code);

        if (!user) {
            throw new VerificationCodeInvalidError();
        }

        if (user.verification_expires_at && user.verification_expires_at < new Date()) {
            throw new VerificationCodeExpiredError();
        }

        await this.userRepository.verifyEmail(user.id);
    }
}
