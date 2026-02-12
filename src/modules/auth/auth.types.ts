export interface JwtPayload {
  sub: string;      // userId
  email: string;
  role: string;
  projectId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  projectId?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
