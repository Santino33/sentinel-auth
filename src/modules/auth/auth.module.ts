import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/user.repository';
import { ProjectUserRepository } from '../../repositories/projectUser.repository';

// Singletons for the module
const jwtService = new JwtService();
const userRepository = new UserRepository();
const projectUserRepository = new ProjectUserRepository();
const authService = new AuthService(jwtService, userRepository, projectUserRepository);

export { jwtService, authService };
