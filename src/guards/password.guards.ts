import { AuthWrongPasswordError } from "../errors/AuthError";
import { BadRequestError } from "../errors/HttpError";
import { verifyKey } from "../utils/keyGenerator";

export async function assertCurrentPassword(
  currentPassword: string,
  storedHash: string
): Promise<void> {
  const isValid = await verifyKey(currentPassword, storedHash);
  if (!isValid) {
    throw new AuthWrongPasswordError();
  }
}

export function assertNewPasswordDifferent(
  currentPassword: string,
  newPassword: string
): void {
  if (currentPassword === newPassword) {
    throw new BadRequestError("New password must be different from current password");
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
