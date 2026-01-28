import jwt from 'jsonwebtoken';
import { JwtPayload } from './auth.types';

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'super-secret-key-change-me';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  }

  /**
   * Generates a new JWT access token.
   * @param payload Data to be encoded in the token.
   * @returns Signed token string.
   */
  async signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    const options: jwt.SignOptions = {
      expiresIn: this.expiresIn as any,
    };
    return jwt.sign(payload, this.secret, options);
  }

  /**
   * Verifies a JWT token and returns its decoded payload.
   * @param token Token to verify.
   * @returns Decoded payload if valid.
   * @throws Error if token is invalid or expired.
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('TOKEN_EXPIRED');
      }
      throw new Error('INVALID_TOKEN');
    }
  }

  /**
   * Decodes a token without verifying the signature.
   * Useful for debugging or extracting claims before full verification.
   */
  decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}
