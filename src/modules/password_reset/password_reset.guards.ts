import { ResetCodeEntity } from "./password_reset.types";
import { ResetCodeExpiredError, ResetCodeNotFoundError, ResetCodeAlreadyUsedError, ResetCodeInvalidError } from "../../errors/ResetError";
import { BadRequestError } from "../../errors/HttpError";

export function assertResetCode(code: string): void {
  if (!code || typeof code !== 'string' || code.length !== 8 || !/^\d+$/.test(code)) {
    throw new ResetCodeInvalidError();
  }
}

export function assertPasswordStrength(password: string): void {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }
  if (!hasUppercase) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!hasLowercase) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!hasNumber) {
    errors.push("Password must contain at least one number");
  }

  if (errors.length > 0) {
    throw new BadRequestError(errors.join(". "));
  }
}

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
