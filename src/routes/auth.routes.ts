import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();

  /**
   * GET /auth/google
   * Initiate Google OAuth flow
   */
  router.get('/auth/google', async (req: Request, res: Response) => {
    try {
      const authUrl = await authService.initiateOAuth();
      res.redirect(authUrl);
    } catch (error) {
      logger.error('Failed to initiate OAuth', error as Error);
      res.status(500).json({ error: 'Failed to initiate authentication' });
    }
  });

  /**
   * GET /auth/google/callback
   * Handle Google OAuth callback
   */
  router.get('/auth/google/callback', async (req: Request, res: Response) => {
    const { code, error } = req.query;

    if (error) {
      logger.error('OAuth error', new Error(error as string));
      return res.status(400).json({ error: 'Authentication failed' });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    try {
      const { user, token } = await authService.handleOAuthCallback(code);
      
      // In production, you might want to:
      // 1. Set an HTTP-only cookie with the token
      // 2. Redirect to a success page with the token
      // 3. Return the token in a secure way
      
      // For now, return JSON with token
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });
    } catch (error) {
      logger.error('OAuth callback failed', error as Error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  /**
   * POST /auth/refresh
   * Refresh JWT token
   */
  router.post('/auth/refresh', async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    try {
      const newToken = await authService.refreshToken(token);
      res.json({ token: newToken });
    } catch (error) {
      logger.error('Token refresh failed', error as Error);
      res.status(401).json({ error: 'Failed to refresh token' });
    }
  });

  /**
   * POST /auth/logout
   * Logout (client-side token deletion)
   */
  router.post('/auth/logout', (req: Request, res: Response) => {
    // With JWT, logout is primarily client-side (delete token)
    // Server can optionally maintain a blacklist of revoked tokens
    res.json({ success: true, message: 'Logged out successfully' });
  });

  /**
   * GET /auth/me
   * Get current user info (requires authentication)
   */
  router.get('/auth/me', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const user = await authService.validateToken(token);
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      });
    } catch (error) {
      logger.error('Token validation failed', error as Error);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  return router;
}
