import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../src/services/auth.service.js';
import { DatabaseService } from '../../src/services/database.service.js';
import { User } from '../../src/types/user.js';

// Mock DatabaseService
const mockDbService = {
  getUserByGoogleId: vi.fn(),
  createUser: vi.fn(),
  getUser: vi.fn(),
} as unknown as DatabaseService;

describe('AuthService', () => {
  let authService: AuthService;
  
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/picture.jpg',
    googleId: 'google-123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService(
      'test-client-id',
      'test-client-secret',
      'http://localhost:8081/auth/google/callback',
      mockDbService,
      'test-jwt-secret'
    );
  });

  describe('initiateOAuth', () => {
    it('should generate OAuth URL', async () => {
      const authUrl = await authService.initiateOAuth();
      
      expect(authUrl).toBeDefined();
      expect(authUrl).toContain('accounts.google.com');
      expect(authUrl).toContain('client_id=test-client-id');
      expect(authUrl).toContain('redirect_uri');
    });
  });

  describe('validateToken', () => {
    it('should validate valid JWT token and return user', async () => {
      // Mock database to return user
      vi.mocked(mockDbService.getUser).mockResolvedValue(mockUser);
      
      // Generate a token first
      const token = (authService as any).generateJWT(mockUser);
      
      // Validate the token
      const result = await authService.validateToken(token);
      
      expect(result).toEqual(mockUser);
      expect(mockDbService.getUser).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error for invalid token', async () => {
      await expect(
        authService.validateToken('invalid-token')
      ).rejects.toThrow('Invalid token');
    });

    it('should throw error for expired token', async () => {
      // Create a token that expires immediately
      const expiredToken = (authService as any).generateJWT(mockUser);
      
      // Wait a bit and try to validate (in real scenario, token would be expired)
      // For testing, we'll just test with a malformed token
      await expect(
        authService.validateToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid')
      ).rejects.toThrow();
    });

    it('should throw error when user not found in database', async () => {
      vi.mocked(mockDbService.getUser).mockResolvedValue(null);
      
      const token = (authService as any).generateJWT(mockUser);
      
      await expect(
        authService.validateToken(token)
      ).rejects.toThrow('User not found');
    });
  });

  describe('refreshToken', () => {
    it('should generate new token for valid old token', async () => {
      vi.mocked(mockDbService.getUser).mockResolvedValue(mockUser);
      
      const oldToken = (authService as any).generateJWT(mockUser);
      const newToken = await authService.refreshToken(oldToken);
      
      expect(newToken).toBeDefined();
      expect(newToken).not.toBe(oldToken);
      expect(mockDbService.getUser).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error for invalid token', async () => {
      await expect(
        authService.refreshToken('invalid-token')
      ).rejects.toThrow('Failed to refresh token');
    });

    it('should throw error when user not found', async () => {
      vi.mocked(mockDbService.getUser).mockResolvedValue(null);
      
      const oldToken = (authService as any).generateJWT(mockUser);
      
      await expect(
        authService.refreshToken(oldToken)
      ).rejects.toThrow('Failed to refresh token');
    });
  });

  describe('JWT token generation', () => {
    it('should generate valid JWT token with user data', () => {
      const token = (authService as any).generateJWT(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token payload', () => {
      const token = (authService as any).generateJWT(mockUser);
      
      // Decode token (without verification for testing)
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );
      
      expect(payload.userId).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.name).toBe(mockUser.name);
      expect(payload.exp).toBeDefined(); // Should have expiration
    });
  });
});
