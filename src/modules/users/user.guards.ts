import { UserAlreadyExistsError, UserEmailAlreadyExistsError } from "../../errors/UserError";

export function assertUserDoesNotExists(existingUser: any | null, username: string) {
    if (existingUser) {
        throw new UserAlreadyExistsError(`User with username '${username}' already exists`);
    }
}

export function assertEmailIsUnique(existingUser: any | null, email: string) {
    if (existingUser) {
        throw new UserEmailAlreadyExistsError(`User with email '${email}' already exists`);
    }
}
