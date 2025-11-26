import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import { AuthService } from '../../src/services/auth.service.js';
import { DatabaseService } from '../../src/services/database.service.js';

describe('Authentication Integration Tests', () => {
  let pool: Pool;
  let dbService: DatabaseService;
  let authService: AuthService;

  beforeAll(async () => {
    // Use test database
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    });

    dbService = new DatabaseService(pool);
    authService = new AuthService(
      'test-client-id',
      'test-client-secret',
      'http://localhost:8081/auth/google/callback',
      dbService,
      'test-jwt-secret-for-integration-tests'
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should generate OAuth URL', async () => {
    const authUrl = await authService.initiateOAuth();
    
    expect(authUrl).toBeDefined();
    expect(authUrl).toContain('accounts.google.com');
    expect(authUrl).toContain('oauth2');
  });

  it('should generate and validate JWT token', async () => {
    // Create a test user first
    const userId = await dbService.createUser({
      email: 'integration-test@example.com',
      name: 'Integration Test User',
      googleId: 'google-integration-test-123',
      picture: 'https://example.com/pic.jpg'
    });

    const user = await dbService.getUser(userId);
    expect(user).toBeDefined();

    if (!user) throw new Error('User not created');

    // Generate JWT token
    const token = (authService as any).generateJWT(user);
    expect(token).toBeDefined();

    // Validate token
    const validatedUser = await authService.validateToken(token);
    expect(validatedUser.id).toBe(user.id);
    expect(validatedUser.email).toBe(user.email);

    // Clean up
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  it('should refresh JWT token', async () => {
    // Create a test user
    const userId = await dbService.createUser({
      email: 'refresh-test@example.com',
      name: 'Refresh Test User',
      googleId: 'google-refresh-test-456',
      picture: 'https://example.com/pic.jpg'
    });

    const user = await dbService.getUser(userId);
    if (!user) throw new Error('User not created');

    // Generate initial token
    const oldToken = (authService as any).generateJWT(user);

    // Refresh token
    const newToken = await authService.refreshToken(oldToken);
    expect(newToken).toBeDefined();
    expect(newToken).not.toBe(oldToken);

    // Validate new token
    const validatedUser = await authService.validateToken(newToken);
    expect(validatedUser.id).toBe(user.id);

    // Clean up
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  });
});
