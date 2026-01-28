/// <reference path="../../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.module';
import { AuthMissingTokenError, AuthTokenExpiredError, AuthInvalidTokenError } from '../../errors/AuthError';
import { RoleForbiddenError, RoleUserNotAuthenticatedError } from '../../errors/RoleError';

/**
 * Authentication Guard (Middleware)
 * Verifies the JWT token and attaches the user to the request.
 */
export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthMissingTokenError();
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const user = await authService.validateToken(token);
      
      // Attach user to request for use in controllers
      req.user = user;
      
      next();
    } catch (error: any) {
      if (error.message === 'TOKEN_EXPIRED') {
        throw new AuthTokenExpiredError();
      }
      throw new AuthInvalidTokenError();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization Guard (Factory)
 * Checks if the authenticated user has the required role.
 */
export const rolesGuard = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new RoleUserNotAuthenticatedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new RoleForbiddenError());
    }

    next();
  };
};
