import { User } from '../types/user.js';

export class AuthService {
  async initiateOAuth(): Promise<string> {
    // TODO: Implement OAuth initiation
    throw new Error('Not implemented');
  }

  async handleOAuthCallback(code: string): Promise<User> {
    // TODO: Implement OAuth callback handling
    throw new Error('Not implemented');
  }

  async validateToken(token: string): Promise<User> {
    // TODO: Implement token validation
    throw new Error('Not implemented');
  }

  async refreshToken(refreshToken: string): Promise<string> {
    // TODO: Implement token refresh
    throw new Error('Not implemented');
  }
}
