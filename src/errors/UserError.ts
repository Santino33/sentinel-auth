import { ConflictError, NotFoundError, BadRequestError } from "./HttpError";

export class UserNotFoundError extends NotFoundError {
    constructor(message: string = "User not found") {
        super(message, "USER_NOT_FOUND");
    }
}

export class UserAlreadyExistsError extends ConflictError {
    constructor(message: string = "User already exists") {
        super(message, "USER_ALREADY_EXISTS");
    }
}

export class UserEmailAlreadyExistsError extends ConflictError {
    constructor(message: string = "User with this email already exists") {
        super(message, "USER_EMAIL_ALREADY_EXISTS");
    }
}

export class UserPasswordRequiredError extends BadRequestError {
    constructor(message: string = "Password is required") {
        super(message, "USER_PASSWORD_REQUIRED");
    }
}
