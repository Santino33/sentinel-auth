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

export class UserEmailNotVerifiedError extends BadRequestError {
    constructor(message: string = "User email is not verified") {
        super(message, "USER_EMAIL_NOT_VERIFIED");
    }
}

export class VerificationCodeInvalidError extends BadRequestError {
    constructor(message: string = "Invalid verification code") {
        super(message, "VERIFICATION_CODE_INVALID");
    }
}

export class VerificationCodeExpiredError extends BadRequestError {
    constructor(message: string = "Verification code has expired") {
        super(message, "VERIFICATION_CODE_EXPIRED");
    }
}
