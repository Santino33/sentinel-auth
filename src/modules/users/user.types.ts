export interface CreateProjectUserData {
    username: string;
    email: string;
    password: string;
    projectId: string;
    roleName: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface UserResponse {
    id: string;
    username: string;
    email: string | null;
    is_active: boolean;
    created_at: Date;
}
