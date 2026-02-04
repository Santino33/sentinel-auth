# Project Context: Sentinel Auth

## Project Overview

**Sentinel Auth** is a production-ready, multi-tenant authentication and authorization service built with Node.js and TypeScript. It provides a robust framework for managing multiple projects (tenants), each with its own isolated ecosystem of users and roles.

Key features include:

- **Multi-tenancy**: Complete isolation of projects, roles, and user memberships.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions managed through project-specific roles.
- **Robust Security**: JWT-based authentication with refresh token support and bcrypt password hashing.
- **Admin Management**: Bootstrap and administrative keys for high-level system operations.

## Architecture

The project follows a **Modular Layered Architecture** inspired by Clean Architecture and Hexagonal principles, ensuring separation of concerns and maintainability.

- **Modules (`src/modules`)**: The core of the application, organized by domain (auth, users, projects, roles, adminKeys).
  - **Controllers**: Handle incoming HTTP requests, validate input, and call services.
  - **Services**: Contain the core business logic.
  - **Repositories**: Abstract the data access layer using Prisma ORM.
  - **Guards**: Pure domain validation functions that assert business rules and throw specific domain errors.
  - **Routers**: Define the API surface for each module.
- **Global Layers**:
  - **`src/errors`**: Centralized domain-specific error classes.
  - **`src/middleware`**: Cross-cutting concerns like authentication guards and global error handling.
  - **`src/lib`**: Shared infrastructure components (e.g., Prisma client).
- **Database**: PostgreSQL with Prisma ORM for type-safe queries and schema management.

## Build and Test Commands

### Development

- `npm run dev`: Starts the application in development mode using `ts-node`.
- `npx prisma generate`: Generates the Prisma Client based on the schema.
- `npx prisma studio`: Opens a GUI to explore the database.

### Production

- `npm run build`: Compiles the TypeScript source code into the `dist` directory.
- `npm run start`: Executes the compiled JavaScript from the `dist` directory.

### Testing/Utility

- `npm run test-db`: Verifies the database connection and basic CRUD operations.
- `ts-node test/<test-file>.ts`: Runs specific integration test scripts found in the `test/` directory.

## Code Style Guidelines

- **TypeScript First**: Strict typing is encouraged for all business logic and data structures.
- **Domain-Driven Error Handling**: Avoid generic `Error` objects. Use the classes in `src/errors` to provide meaningful feedback and HTTP status codes.
- **Separation of Concerns**: Keep controllers thin. Services should contain logic, and Repositories should handle database interactions.
- **Guard Pattern**: Use the `assert*` pattern in `*.guards.ts` files to validate state before performing operations.
- **Naming Conventions**:
  - Files: `feature.type.ts` (e.g., `user.service.ts`).
  - Methods/Variables: `camelCase`.
  - Classes/Interfaces: `PascalCase`.

## Testing Instructions

The project currently uses script-based integration tests located in the `test/` folder.

1. Ensure the database is running (standardly via Docker or a local instance).
2. Run connectivity tests: `npm run test-db`.
3. Run functional flow tests:
   - User creation and login: `ts-node test/test-create-login.ts`
   - Full authentication flow: `ts-node test/test-flow.ts`
   - Refresh token logic: `ts-node test/test-refresh-token.ts`
   - Edge cases: `ts-node test/test-login-edge-cases.ts`

## Security Considerations

- **Password Safety**: Hashing is performed using `bcrypt`. The salt is automatically handled and embedded within the hash string.
- **Token Management**:
  - Short-lived Access Tokens (JWT).
  - Long-lived Refresh Tokens with a `revoked` flag for session invalidation.
- **Tenant Isolation**: All queries must respect `project_id` boundaries to prevent cross-tenant data leakage.
- **API Security**:
  - Administrative endpoints are protected by `admin_keys`.
  - Project-specific endpoints are protected by the `projects.api_key`.
- **Environment Variables**: Sensitive configuration (DB URLs, Secret Keys) must be stored in `.env` and never committed to version control.

## Agent Instructions

- **Documentation & Libraries**: Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

## Critical Gaps for Production

The following features are missing for a production-ready authentication service:

### Priority 1: Password Reset Flow (CRITICAL)

**Current State:**
- Database table `password_reset_codes` exists
- Repository `resetCode.repository.ts` exists
- **NO service, controller, or router for password reset**

**Missing Components:**
- `password_reset.service.ts` - Logic for code generation/validation
- `password_reset.controller.ts` - HTTP handlers
- `password_reset.router.ts` - API endpoints
- EmailService (abstraction) - To send reset emails

**Required Endpoints:**
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Validate code, reset password

### Priority 2: User Account Management

| Missing Feature | Impact |
|----------------|--------|
| Change password | Users cannot update credentials |
| Email verification | No email ownership confirmation |
| User deactivation | Soft delete for users |
| User deletion | Permanent account removal |

### Priority 3: Security Enhancements

| Missing Feature | Risk Level | Description |
|-----------------|------------|-------------|
| Password strength policy | HIGH | No validation of password complexity |
| Rate limiting | HIGH | No brute-force protection |
| Audit logging | MEDIUM | Auth events not logged comprehensively |
| Login attempt tracking | MEDIUM | No failed login monitoring |

### Priority 4: Session Management

| Missing Feature | Description |
|----------------|-------------|
| Active sessions list | Users cannot see logged-in devices |
| Single session enforcement | No "logout from all devices" |
| Per-device token invalidation | Cannot revoke specific sessions |
| Session timeout | No inactivity-based logout |

### Recommended Next Feature

Implement the **Password Reset Flow** because:
1. **Infrastructure exists** - Repository and schema table already created
2. **Security critical** - Without it, users cannot recover accounts
3. **Clear scope** - Defined start/end points
4. **Enables other features** - Foundation for email verification
