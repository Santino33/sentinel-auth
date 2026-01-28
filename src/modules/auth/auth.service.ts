import { JwtService } from './jwt.service';
import { AuthUser, TokenResponse } from './auth.types';

export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generates tokens for a successfully authenticated user.
   */
  async login(user: AuthUser): Promise<TokenResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      projectId: user.projectId,
    };

    const accessToken = await this.jwtService.signToken(payload);
    
    // We can calculate expiresIn by decoding the token or setting it from config
    // For now, returning a static number or extracting from config
    return {
      accessToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  /**
   * Validates a token and returns the user context.
   */
  async validateToken(token: string): Promise<AuthUser> {
    const payload = await this.jwtService.verifyToken(token);
    
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      projectId: payload.projectId,
    };
  }
}
