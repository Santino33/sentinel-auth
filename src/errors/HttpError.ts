import { BaseError } from "./BaseError";

export class HttpError extends BaseError {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string
  ) {
    super(message);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = "Bad Request", errorCode: string = "BAD_REQUEST") {
    super(400, errorCode, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized", errorCode: string = "UNAUTHORIZED") {
    super(401, errorCode, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = "Forbidden", errorCode: string = "FORBIDDEN") {
    super(403, errorCode, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = "Not Found", errorCode: string = "NOT_FOUND") {
    super(404, errorCode, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = "Conflict", errorCode: string = "CONFLICT") {
    super(409, errorCode, message);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = "Internal Server Error", errorCode: string = "INTERNAL_SERVER_ERROR") {
    super(500, errorCode, message);
  }
}
