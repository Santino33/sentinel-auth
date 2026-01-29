import { JwtService } from './jwt.service';
import { AuthUser, TokenResponse } from './auth.types';
import { UserRepository } from '../users/user.repository';
import { ProjectUserRepository } from '../../repositories/projectUser.repository';
import { RefreshTokenRepository } from './refreshToken.repository';
import { verifyKey, generateKey } from '../../utils/keyGenerator';
import { 
  AuthInvalidCredentialsError, 
  AuthUserNotInProjectError,
  AuthInvalidTokenError
} from '../../errors/AuthError';

export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly projectUserRepository: ProjectUserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  /**
   * Validates user credentials and project membership, then generates tokens.
   */
  async authenticate(email: string, password: string, projectId: string): Promise<TokenResponse> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new AuthInvalidCredentialsError();
    }

    const isPasswordValid = await verifyKey(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AuthInvalidCredentialsError();
    }

    const projectUsers = await this.projectUserRepository.getProjectUsersByUserId(user.id);
    const membership = projectUsers.find(pu => pu.project_id === projectId);

    if (!membership) {
      throw new AuthUserNotInProjectError();
    }

    return this.login({
      id: user.id,
      email: user.email || '',
      role: membership.roles.name, 
      projectId: projectId,
    });
  }

  /**
   * Generates tokens for a successfully authenticated user.
   * Also persists the Refresh Token in the database.
   */
  async login(user: AuthUser): Promise<TokenResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      projectId: user.projectId,
    };

    // 1. Generate Access Token
    const accessToken = await this.jwtService.signToken(payload);
    
    // 2. Generate Refresh Token (Secured string)
    const refreshToken = await generateKey();
    
    // 3. Persist Refresh Token (Expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.createRefreshToken({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
    };
  }

  /**
   * Uses a Valid Refresh Token to issue a new pair of tokens.
   */
  async refreshToken(token: string, projectId: string): Promise<TokenResponse> {
    // 1. Find token in DB
    const tokenEntity = await this.refreshTokenRepository.findByToken(token);
    
    // 2. Security checks
    if (!tokenEntity || tokenEntity.revoked || tokenEntity.expires_at < new Date()) {
      throw new AuthInvalidTokenError("Refresh token is invalid, expired or revoked");
    }

    // 3. Verify project membership and get current role
    const projectUsers = await this.projectUserRepository.getProjectUsersByUserId(tokenEntity.user_id);
    const membership = projectUsers.find(pu => pu.project_id === projectId);

    if (!membership) {
      throw new AuthUserNotInProjectError();
    }

    // 4. (Optional but recommended) Revoke old token
    await this.refreshTokenRepository.revokeToken(token);

    // 5. Issue new tokens
    return this.login({
      id: tokenEntity.users.id,
      email: tokenEntity.users.email || '',
      role: membership.roles.name,
      projectId: projectId
    });
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
