/**
 * Example: Google OAuth Authentication Flow
 * 
 * This example demonstrates how to authenticate users with Google OAuth
 * and use JWT tokens for subsequent requests.
 */

import { AuthService } from '../src/services/auth.service.js';
import { DatabaseService } from '../src/services/database.service.js';
import { createDatabasePool } from '../src/config/database.js';
import { loadEnvironment } from '../src/config/environment.js';

async function demonstrateAuthFlow() {
  console.log('=== FeedMob AdPilot Authentication Flow Demo ===\n');

  // Load environment
  const env = loadEnvironment();

  // Initialize services
  const dbPool = createDatabasePool(env.DATABASE_URL, env.DATABASE_POOL_SIZE);
  const dbService = new DatabaseService(dbPool);
  const authService = new AuthService(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALLBACK_URL,
    dbService,
    env.JWT_SECRET
  );

  try {
    // Step 1: Generate OAuth URL
    console.log('Step 1: Generate OAuth URL');
    const authUrl = await authService.initiateOAuth();
    console.log('OAuth URL:', authUrl);
    console.log('→ User would visit this URL to authenticate with Google\n');

    // Step 2: Simulate OAuth callback (in real flow, Google redirects here)
    console.log('Step 2: OAuth Callback');
    console.log('→ After user authenticates, Google redirects to callback URL with code');
    console.log('→ Server exchanges code for tokens and creates/retrieves user\n');

    // Step 3: Demonstrate JWT token generation
    console.log('Step 3: JWT Token Generation');
    
    // Create a demo user (simulating OAuth callback result)
    const demoUserId = await dbService.createUser({
      email: 'demo@example.com',
      name: 'Demo User',
      googleId: 'google-demo-123',
      picture: 'https://example.com/demo.jpg'
    });

    const demoUser = await dbService.getUser(demoUserId);
    if (!demoUser) throw new Error('Failed to create demo user');

    // Generate JWT token
    const jwtToken = (authService as any).generateJWT(demoUser);
    console.log('Generated JWT Token:', jwtToken.substring(0, 50) + '...');
    console.log('→ This token is returned to the client\n');

    // Step 4: Validate token
    console.log('Step 4: Token Validation');
    const validatedUser = await authService.validateToken(jwtToken);
    console.log('Validated User:', {
      id: validatedUser.id,
      email: validatedUser.email,
      name: validatedUser.name
    });
    console.log('→ Token is valid and user is authenticated\n');

    // Step 5: Refresh token
    console.log('Step 5: Token Refresh');
    const newToken = await authService.refreshToken(jwtToken);
    console.log('New JWT Token:', newToken.substring(0, 50) + '...');
    console.log('→ Client can refresh token before expiry\n');

    // Step 6: Use token in MCP requests
    console.log('Step 6: Using Token in MCP Requests');
    console.log('Include token in Authorization header:');
    console.log('Authorization: Bearer', jwtToken.substring(0, 30) + '...');
    console.log('→ All MCP tool calls will be authenticated\n');

    // Clean up demo user
    await dbPool.query('DELETE FROM users WHERE id = $1', [demoUserId]);
    console.log('✓ Demo completed successfully');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dbService.close();
  }
}

// Run the demo
demonstrateAuthFlow().catch(console.error);
