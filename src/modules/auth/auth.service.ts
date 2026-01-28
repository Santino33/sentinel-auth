import { JwtService } from './jwt.service';
import { AuthUser, TokenResponse } from './auth.types';
import { UserRepository } from '../users/user.repository';
import { ProjectUserRepository } from '../../repositories/projectUser.repository';
import { verifyKey } from '../../utils/keyGenerator';
import { AuthInvalidCredentialsError, AuthUserNotInProjectError } from '../../errors/AuthError';

export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly projectUserRepository: ProjectUserRepository
  ) {}

  /**
   * Validates user credentials and project membership, then generates tokens.
   */
  async authenticate(email: string, password: string, projectId: string): Promise<TokenResponse> {
    // 1. Find user by email
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new AuthInvalidCredentialsError();
    }

    // 2. Verify password
    const isPasswordValid = await verifyKey(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AuthInvalidCredentialsError();
    }

    // 3. Verify project membership and get role
    const projectUsers = await this.projectUserRepository.getProjectUsersByUserId(user.id);
    const membership = projectUsers.find(pu => pu.project_id === projectId);

    if (!membership) {
      throw new AuthUserNotInProjectError();
    }

    // 4. Generate token
    return this.login({
      id: user.id,
      email: user.email || '',
      role: membership.roles.name, // Assuming it's included in the relation
      projectId: projectId,
    });
  }

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
