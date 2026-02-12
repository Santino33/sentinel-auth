import { ResetCodeEntity } from "./password_reset.types";
import { ResetCodeExpiredError, ResetCodeNotFoundError, ResetCodeAlreadyUsedError, ResetCodeInvalidError } from "../../errors/ResetError";
import { BadRequestError } from "../../errors/HttpError";
import { assertPasswordStrength } from "../../guards/password.guards";

export function assertEmailFormat(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new BadRequestError("Invalid email format");
  }
}

export function assertResetCode(code: string): void {
  if (!code || typeof code !== 'string' || code.length !== 8 || !/^\d+$/.test(code)) {
    throw new ResetCodeInvalidError();
  }
}

export { assertPasswordStrength };

export function assertResetCodeExists(code: ResetCodeEntity | null | undefined): asserts code is ResetCodeEntity {
  if (!code) {
    throw new ResetCodeNotFoundError();
  }
}

export function assertResetCodeNotUsed(code: ResetCodeEntity): void {
  if (code.used) {
    throw new ResetCodeAlreadyUsedError();
  }
}

export function assertResetCodeNotExpired(code: ResetCodeEntity): void {
  if (code.expires_at < new Date()) {
    throw new ResetCodeExpiredError();
  }
}
