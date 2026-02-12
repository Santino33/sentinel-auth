import { BadRequestError, NotFoundError, InternalServerError, ConflictError, ForbiddenError, UnauthorizedError } from "./HttpError";

export class RoleForbiddenError extends ForbiddenError {
    constructor(message: string = "You do not have permission to access this resource") {
        super(message, "ROLE_FORBIDDEN");
    }
}

export class RoleUserNotAuthenticatedError extends UnauthorizedError {
    constructor(message: string = "User not authenticated") {
        super(message, "USER_NOT_AUTHENTICATED");
    }
}

export class RoleNameIsRepeatedError extends ConflictError {
    constructor(message: string = "Role name is repeated") {
        super(message, "ROLE_NAME_IS_REPEATED");
    }
}

export class RoleNameRequiredError extends BadRequestError {
    constructor(message: string = "Role name is required") {
        super(message, "ROLE_NAME_REQUIRED");
    }
}

export class RoleNotFoundError extends NotFoundError {
    constructor(message: string = "Role not found") {
        super(message, "ROLE_NOT_FOUND");
    }
}

export class RoleAlreadyExistsError extends ConflictError {
    constructor(message: string = "Role already exists") {
        super(message, "ROLE_ALREADY_EXISTS");
    }
}

export class RoleNotUpdatedError extends InternalServerError {
    constructor(message: string = "Role not updated") {
        super(message, "ROLE_NOT_UPDATED");
    }
}

export class RoleNotCreatedError extends InternalServerError {
    constructor(message: string = "Role not created") {
        super(message, "ROLE_NOT_CREATED");
    }
}

export class RoleNotDeletedError extends InternalServerError {
    constructor(message: string = "Role not deleted") {
        super(message, "ROLE_NOT_DELETED");
    }
}