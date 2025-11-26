import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../types/user.js';
import { DatabaseService } from './database.service.js';
import { logger } from '../utils/logger.js';

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

interface GoogleUserInfo {
  sub: string; // Google ID
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export class AuthService {
  private oauth2Client: OAuth2Client;
  private jwtSecret: string;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private redirectUri: string,
    private dbService: DatabaseService,
    jwtSecret?: string
  ) {
    this.oauth2Client = new OAuth2Client(
      clientId,
      clientSecret,
      redirectUri
    );
    
    // Use provided JWT secret or generate one (in production, this should be from env)
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'default-secret-change-in-production';
    
    if (this.jwtSecret === 'default-secret-change-in-production') {
      logger.warn('Using default JWT secret. Set JWT_SECRET environment variable in production.');
    }
  }

  /**
   * Generate OAuth URL for user to authenticate with Google
   */
  async initiateOAuth(): Promise<string> {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent'
    });
    
    logger.info('Generated OAuth URL');
    return authUrl;
  }

  /**
   * Handle OAuth callback and create/retrieve user
   */
  async handleOAuthCallback(code: string): Promise<{ user: User; token: string }> {
    try {
      // Exchange authorization code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Verify and decode the ID token
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: this.clientId
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      const googleUserInfo: GoogleUserInfo = {
        sub: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        email_verified: payload.email_verified || false
      };

      if (!googleUserInfo.email_verified) {
        throw new Error('Email not verified');
      }

      // Get or create user in database
      let user = await this.dbService.getUserByGoogleId(googleUserInfo.sub);
      
      if (!user) {
        // Create new user
        const userId = await this.dbService.createUser({
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          picture: googleUserInfo.picture,
          googleId: googleUserInfo.sub
        });
        
        user = await this.dbService.getUser(userId);
        if (!user) {
          throw new Error('Failed to create user');
        }
        
        logger.info('Created new user', { userId: user.id, email: user.email });
      } else {
        logger.info('User logged in', { userId: user.id, email: user.email });
      }

      // Generate JWT token
      const jwtToken = this.generateJWT(user);

      return { user, token: jwtToken };
    } catch (error) {
      logger.error('OAuth callback failed', error as Error);
      throw new Error(`OAuth authentication failed: ${(error as Error).message}`);
    }
  }

  /**
   * Validate JWT token and return user
   */
  async validateToken(token: string): Promise<User> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      
      // Retrieve user from database
      const user = await this.dbService.getUser(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw error;
    }
  }

  /**
   * Generate JWT token for user
   */
  private generateJWT(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name
    };
    
    // Token expires in 7 days
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
  }

  /**
   * Refresh JWT token (generates new token with extended expiry)
   */
  async refreshToken(oldToken: string): Promise<string> {
    try {
      // Validate the old token (even if expired, we can still decode it)
      const decoded = jwt.decode(oldToken) as TokenPayload;
      
      if (!decoded || !decoded.userId) {
        throw new Error('Invalid token');
      }
      
      // Get user from database
      const user = await this.dbService.getUser(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate new token
      return this.generateJWT(user);
    } catch (error) {
      logger.error('Token refresh failed', error as Error);
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Verify Google ID token directly (alternative to OAuth flow)
   */
  async verifyGoogleIdToken(idToken: string): Promise<{ user: User; token: string }> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: this.clientId
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      const googleUserInfo: GoogleUserInfo = {
        sub: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        email_verified: payload.email_verified || false
      };

      if (!googleUserInfo.email_verified) {
        throw new Error('Email not verified');
      }

      // Get or create user
      let user = await this.dbService.getUserByGoogleId(googleUserInfo.sub);
      
      if (!user) {
        const userId = await this.dbService.createUser({
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          picture: googleUserInfo.picture,
          googleId: googleUserInfo.sub
        });
        
        user = await this.dbService.getUser(userId);
        if (!user) {
          throw new Error('Failed to create user');
        }
      }

      // Generate JWT token
      const jwtToken = this.generateJWT(user);

      return { user, token: jwtToken };
    } catch (error) {
      logger.error('Google ID token verification failed', error as Error);
      throw new Error(`Token verification failed: ${(error as Error).message}`);
    }
  }
}
