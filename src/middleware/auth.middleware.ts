import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { User } from '../types/user.js';
import { logger } from '../utils/logger.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT token
 */
export function authenticateRequest(authService: AuthService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const user = await authService.validateToken(token);
      req.user = user;
      next();
    } catch (error) {
      logger.error('Authentication middleware failed', error as Error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  };
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export function optionalAuthentication(authService: AuthService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const user = await authService.validateToken(token);
      req.user = user;
    } catch (error) {
      // Silently fail for optional auth
      logger.debug('Optional authentication failed', { error: (error as Error).message });
    }

    next();
  };
}
