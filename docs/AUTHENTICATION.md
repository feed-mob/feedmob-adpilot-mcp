# Authentication Guide

## Overview

FeedMob AdPilot uses Google OAuth 2.0 for user authentication and JWT tokens for session management.

## Architecture

- **Google OAuth 2.0**: Users authenticate via Google
- **JWT Tokens**: Stateless authentication for MCP requests
- **Session Store**: In-memory session management (use Redis in production)
- **Express Routes**: Separate authentication endpoints on port 8081

## Setup

### 1. Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:8081/auth/google/callback` (development)
   - `https://your-domain.com/auth/google/callback` (production)

### 2. Environment Variables

Update your `.env` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8081/auth/google/callback
JWT_SECRET=your-secret-jwt-key-change-in-production
```

### 3. Generate JWT Secret

For production, generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Authentication Flow

### 1. OAuth Flow

```
User → /auth/google → Google Login → /auth/google/callback → JWT Token
```

**Step 1: Initiate OAuth**
```bash
GET http://localhost:8081/auth/google
```

This redirects to Google's login page.

**Step 2: Handle Callback**

After successful login, Google redirects to:
```
GET http://localhost:8081/auth/google/callback?code=AUTHORIZATION_CODE
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://..."
  }
}
```

### 2. Using JWT Token

Include the JWT token in all MCP requests:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Token Refresh

Tokens expire after 7 days. Refresh before expiry:

```bash
POST http://localhost:8081/auth/refresh
Content-Type: application/json

{
  "token": "old-token"
}
```

Response:
```json
{
  "token": "new-token"
}
```

### 4. Get Current User

```bash
GET http://localhost:8081/auth/me
Authorization: Bearer your-token
```

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://..."
}
```

### 5. Logout

```bash
POST http://localhost:8081/auth/logout
```

Note: With JWT, logout is primarily client-side (delete the token).

## MCP Client Integration

### FastMCP Authentication

The MCP server validates JWT tokens for all tool calls:

```typescript
const server = new FastMCP({
  authenticate: async (request) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const user = await authService.validateToken(token);
    return {
      userId: user.id,
      email: user.email,
      name: user.name
    };
  }
});
```

### Client Example

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

// 1. Get JWT token via OAuth flow
const authResponse = await fetch('http://localhost:8081/auth/google');
// ... complete OAuth flow ...

// 2. Use token in MCP client
const client = new Client({
  name: "my-client",
  version: "1.0.0"
});

await client.connect({
  url: "http://localhost:8080/mcp",
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});

// 3. Call tools (authentication handled automatically)
const result = await client.callTool('parseCampaignRequest', {
  requestText: 'I want to run a TikTok campaign'
});
```

## Security Best Practices

### 1. JWT Secret

- **Never** commit JWT_SECRET to version control
- Use a strong, random secret (64+ characters)
- Rotate secrets periodically
- Use different secrets for dev/staging/production

### 2. Token Storage

**Client-side:**
- Store tokens in memory or secure storage (not localStorage)
- Use HTTP-only cookies for web apps
- Clear tokens on logout

**Server-side:**
- Validate tokens on every request
- Check token expiration
- Implement token blacklist for revoked tokens (optional)

### 3. CORS Configuration

Configure CORS to allow only trusted origins:

```typescript
app.use(cors({
  origin: ['https://your-app.com'],
  credentials: true
}));
```

### 4. HTTPS

Always use HTTPS in production:
- Protects tokens in transit
- Required for secure cookies
- Prevents man-in-the-middle attacks

## Database Integration

### User Creation

On first login, a user record is created:

```sql
INSERT INTO users (email, name, picture, google_id)
VALUES ($1, $2, $3, $4)
RETURNING id;
```

### User Retrieval

Subsequent logins retrieve existing user:

```sql
SELECT * FROM users WHERE google_id = $1;
```

## Testing

### Manual Testing

1. Start the server:
```bash
npm run dev
```

2. Open browser to:
```
http://localhost:8081/auth/google
```

3. Complete Google login

4. Copy the JWT token from response

5. Test MCP endpoint:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/mcp
```

### Automated Testing

See `tests/unit/services/auth.service.test.ts` for unit tests.

## Troubleshooting

### "Unauthorized" Error

- Check token is included in Authorization header
- Verify token hasn't expired
- Ensure JWT_SECRET matches between token generation and validation

### "Invalid token" Error

- Token may be malformed
- JWT_SECRET may have changed
- Token may have expired

### OAuth Callback Error

- Verify GOOGLE_CALLBACK_URL matches Google Console configuration
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Ensure redirect URI is authorized in Google Console

### Database Connection Error

- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure users table exists (run migrations)

## Production Considerations

### 1. Session Store

Replace in-memory session store with Redis:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

class RedisSessionStore {
  async createSession(sessionId: string, user: User, expiresInMs: number) {
    await redis.setex(
      `session:${sessionId}`,
      expiresInMs / 1000,
      JSON.stringify(user)
    );
  }
  
  async getSession(sessionId: string): Promise<User | null> {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }
}
```

### 2. Token Blacklist

Implement token revocation:

```typescript
const revokedTokens = new Set<string>();

async function revokeToken(token: string) {
  revokedTokens.add(token);
  // Also store in Redis with expiration
}

async function isTokenRevoked(token: string): Promise<boolean> {
  return revokedTokens.has(token);
}
```

### 3. Rate Limiting

Add rate limiting to auth endpoints:

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per window
});

app.use('/auth', authLimiter);
```

### 4. Monitoring

Log authentication events:

```typescript
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  timestamp: new Date(),
  ip: req.ip
});
```

## API Reference

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/google` | Initiate OAuth flow | No |
| GET | `/auth/google/callback` | OAuth callback | No |
| POST | `/auth/refresh` | Refresh JWT token | No |
| POST | `/auth/logout` | Logout | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/health` | Health check | No |

### Response Codes

- `200` - Success
- `400` - Bad request (missing parameters)
- `401` - Unauthorized (invalid/missing token)
- `500` - Server error

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT.io](https://jwt.io/)
- [FastMCP Documentation](https://github.com/punkpeye/fastmcp)
