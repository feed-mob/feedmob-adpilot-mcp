# Authentication Quick Start

## 5-Minute Setup

### 1. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Google OAuth credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8081/auth/google/callback
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

### 2. Start the Server

```bash
# Start database
npm run db:start

# Run migrations
npm run db:migrate

# Start server
npm run dev
```

The server will start on:
- **MCP Server**: http://localhost:8080/mcp
- **Auth Server**: http://localhost:8081

### 3. Test Authentication

#### Option A: Browser Flow

1. Open browser to: http://localhost:8081/auth/google
2. Login with Google
3. Copy the JWT token from the response
4. Use token in MCP requests

#### Option B: cURL

```bash
# 1. Get OAuth URL
curl http://localhost:8081/auth/google

# 2. Visit URL in browser, complete login

# 3. After callback, you'll get a token
# Use it in MCP requests:
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/mcp
```

### 4. Use in MCP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: "my-client",
  version: "1.0.0"
});

await client.connect({
  url: "http://localhost:8080/mcp",
  headers: {
    'Authorization': `Bearer ${yourJwtToken}`
  }
});
```

## Common Tasks

### Get Current User

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8081/auth/me
```

### Refresh Token

```bash
curl -X POST http://localhost:8081/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"token": "YOUR_OLD_TOKEN"}'
```

### Logout

```bash
curl -X POST http://localhost:8081/auth/logout
```

## Troubleshooting

### "Unauthorized" Error
- Check token is in Authorization header
- Verify token hasn't expired (7 days)
- Ensure JWT_SECRET is set

### OAuth Callback Error
- Verify GOOGLE_CALLBACK_URL matches Google Console
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Ensure redirect URI is authorized

### Database Error
- Run migrations: `npm run db:migrate`
- Check DATABASE_URL is correct
- Verify PostgreSQL is running

## Next Steps

- Read full [Authentication Guide](./AUTHENTICATION.md)
- See [API Reference](./AUTHENTICATION.md#api-reference)
- Check [Security Best Practices](./AUTHENTICATION.md#security-best-practices)
