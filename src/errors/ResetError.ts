import { UnauthorizedError } from "./HttpError";
import { NotFoundError } from "./HttpError";

export class ResetCodeExpiredError extends UnauthorizedError {
  constructor(message: string = "Reset code has expired") {
    super(message, "RESET_CODE_EXPIRED");
  }
}

export class ResetCodeNotFoundError extends UnauthorizedError {
  constructor(message: string = "Invalid reset code") {
    super(message, "RESET_CODE_NOT_FOUND");
  }
}

export class ResetCodeAlreadyUsedError extends UnauthorizedError {
  constructor(message: string = "Reset code has already been used") {
    super(message, "RESET_CODE_ALREADY_USED");
  }
}

export class ResetUserNotFoundError extends NotFoundError {
  constructor(message: string = "User not found") {
    super(message, "RESET_USER_NOT_FOUND");
  }
}

export class ResetCodeInvalidError extends UnauthorizedError {
  constructor(message: string = "Invalid reset code format") {
    super(message, "RESET_CODE_INVALID");
  }
}

export class ResetPasswordWeakError extends UnauthorizedError {
  constructor(message: string = "Password does not meet strength requirements") {
    super(message, "RESET_PASSWORD_WEAK");
  }
}
