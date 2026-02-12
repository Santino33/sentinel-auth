import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from "./HttpError";

export class ProjectNotFoundError extends NotFoundError {
  constructor(message: string = "Project not found") {
    super(message, "PROJECT_NOT_FOUND");
  }
}

export class ProjectDisabledError extends ForbiddenError {
  constructor(message: string = "Project is disabled") {
    super(message, "PROJECT_DISABLED");
  }
}

export class ProjectAlreadyDisabledError extends ConflictError {
  constructor(message: string = "Project is already disabled") {
    super(message, "PROJECT_ALREADY_DISABLED");
  }
}

export class ProjectAlreadyActiveError extends ConflictError {
  constructor(message: string = "Project is already active") {
    super(message, "PROJECT_ALREADY_ACTIVE");
  }
}

export class ProjectNameRequiredError extends BadRequestError {
  constructor(message: string = "Project name is required") {
    super(message, "PROJECT_NAME_REQUIRED");
  }
}
export class ProjectNameIsRepeatedError extends BadRequestError {
  constructor(message: string = "Project name is repeated") {
    super(message, "PROJECT_NAME_IS_REPEATED");
  }
}


