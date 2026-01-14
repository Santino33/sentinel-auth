# Error Handling System

This project uses a centralized error handling system designed with Clean Architecture principles.

## Structure

- `BaseError.ts`: Abstract base class for all application errors. Ensures consistency in response format.
- `HttpError.ts`: Generic HTTP-specific errors (400, 401, 403, 404, etc.).
- `Domain Errors`: Specific errors for each module (e.g., `AdminKeyError.ts`).

## How to add new Domain Errors

1. Identify which HTTP status code fits your error (e.g., 404 for Not Found, 400 for Validation).
2. Create a new file in `src/errors/` for your domain (if it doesn't exist).
3. Inherit from the appropriate `HttpError` class.
4. Define a unique `errorCode` string.

Example:

```typescript
import { ConflictError } from "./HttpError";

export class ProjectAlreadyExistsError extends ConflictError {
  constructor(projectName: string) {
    super(
      `Project with name "${projectName}" already exists`,
      "PROJECT_ALREADY_EXISTS"
    );
  }
}
```

## Usage in Services

Services should throw these errors directly. They should NOT handle HTTP responses or use the `res` object.

```typescript
async getProject(id: string) {
  const project = await this.repo.findById(id);
  if (!project) {
    throw new ProjectNotFoundError();
  }
  return project;
}
```

## Usage in Controllers

Controllers should use the `asyncHandler` wrapper in their routes to ensure errors are caught and passed to the global middleware. There is no need for `try/catch` blocks for business logic errors.

```typescript
// router.ts
router.get(
  "/projects/:id",
  asyncHandler((req, res) => projectController.getProject(req, res))
);
```
