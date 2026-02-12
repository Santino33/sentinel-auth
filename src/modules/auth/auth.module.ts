import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { userRepository, projectUserRepository, refreshTokenRepository } from '../repositories.module';

const jwtService = new JwtService();

const authService = new AuthService(
    jwtService,
    userRepository,
    projectUserRepository,
    refreshTokenRepository
);

export { jwtService, authService };
