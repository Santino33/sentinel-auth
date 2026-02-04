import { UnauthorizedError } from "./HttpError";

export class AuthMissingTokenError extends UnauthorizedError {
  constructor(message: string = "Missing or invalid authorization header") {
    super(message, "AUTH_MISSING_TOKEN");
  }
}

export class AuthTokenExpiredError extends UnauthorizedError {
  constructor(message: string = "Token has expired") {
    super(message, "AUTH_TOKEN_EXPIRED");
  }
}

export class AuthInvalidTokenError extends UnauthorizedError {
  constructor(message: string = "Invalid token") {
    super(message, "AUTH_INVALID_TOKEN");
  }
}

export class AuthWrongPasswordError extends UnauthorizedError {
  constructor(message: string = "Current password is incorrect") {
    super(message, "AUTH_WRONG_PASSWORD");
  }
}

export class AuthInvalidCredentialsError extends UnauthorizedError {
  constructor(message: string = "Invalid email or password") {
    super(message, "AUTH_INVALID_CREDENTIALS");
  }
}

export class AuthUserNotInProjectError extends UnauthorizedError {
  constructor(message: string = "User does not have access to this project") {
    super(message, "AUTH_USER_NOT_IN_PROJECT");
  }
}
