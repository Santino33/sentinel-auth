import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';

// Singletons for the module
const jwtService = new JwtService();
const authService = new AuthService(jwtService);

export { jwtService, authService };
