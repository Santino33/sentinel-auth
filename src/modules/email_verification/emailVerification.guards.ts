import crypto from "crypto";
import { BadRequestError } from "../../errors/HttpError";

export function assertVerificationCode(code: string): void {
    if (!code || typeof code !== 'string' || code.length !== 8 || !/^\d+$/.test(code)) {
        throw new BadRequestError("Invalid verification code", "VERIFICATION_CODE_INVALID");
    }
}

export function assertVerificationCodeNotExpired(expiresAt: Date | null): void {
    if (!expiresAt || expiresAt < new Date()) {
        throw new BadRequestError("Verification code has expired", "VERIFICATION_CODE_EXPIRED");
    }
}

export function generateVerificationCode(): string {
    return crypto.randomInt(10000000, 99999999).toString();
}
