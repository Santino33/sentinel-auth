import { AuthWrongPasswordError } from "../../errors/AuthError";
import { BadRequestError } from "../../errors/HttpError";
import { verifyKey } from "../../utils/keyGenerator";

export async function assertCurrentPassword(
  currentPassword: string,
  storedHash: string
): Promise<void> {
  const isValid = await verifyKey(currentPassword, storedHash);
  if (!isValid) {
    throw new AuthWrongPasswordError();
  }
}

export function assertNewPasswordDifferent(currentPassword: string, newPassword: string): void {
  if (currentPassword === newPassword) {
    throw new BadRequestError("New password must be different from current password");
  }
}
