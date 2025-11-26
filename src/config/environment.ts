import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.string().default('8080'),
  HOST: z.string().default('localhost'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string(),
  DATABASE_POOL_SIZE: z.string().transform(Number).default('20'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  JWT_SECRET: z.string().optional(),
  
  // Claude API
  ANTHROPIC_API_KEY: z.string(),
  CLAUDE_MODEL: z.string().default('claude-3-5-sonnet-20241022'),
  
  // Image Generation (optional)
  IMAGE_SERVICE_URL: z.string().optional(),
  IMAGE_SERVICE_API_KEY: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

export function loadEnvironment(): Environment {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('Environment validation failed:');
    console.error(parsed.error.format());
    process.exit(1);
  }
  
  return parsed.data;
}
