import { NotFoundError, BadRequestError } from "./HttpError";

export class AdminKeyNotFoundError extends NotFoundError {
  constructor(message: string = "Admin key not found") {
    super(message, "ADMIN_KEY_NOT_FOUND");
  }
}

export class AdminKeyRequiredError extends BadRequestError {
  constructor(message: string = "At least one admin key is required") {
    super(message, "ADMIN_KEY_REQUIRED");
  }
}

export class AdminKeyDisabledError extends BadRequestError {
  constructor(message: string = "Admin key is disabled") {
    super(message, "ADMIN_KEY_DISABLED");
  }
}

export class AdminKeyAlreadyDisabledError extends BadRequestError {
  constructor(message: string = "Admin key is already disabled") {
    super(message, "ADMIN_KEY_ALREADY_DISABLED");
  }
}

export class AdminKeyAlreadyActiveError extends BadRequestError {
  constructor(message: string = "Admin key is already active") {
    super(message, "ADMIN_KEY_ALREADY_ACTIVE");
  }
}

export class NotEnoughAdminKeysError extends BadRequestError {
  constructor(message: string = "Not able to disable admin key. At least one active admin key is required") {
    super(message, "NOT_ENOUGH_ADMIN_KEYS");
  }
}
