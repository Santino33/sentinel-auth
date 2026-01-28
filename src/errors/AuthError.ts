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
