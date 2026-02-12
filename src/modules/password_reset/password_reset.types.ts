export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetCodeEntity {
  id: string;
  user_id: string;
  code: string;
  expires_at: Date;
  used: boolean | null;
  created_at: Date;
}
