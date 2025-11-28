import { z } from 'zod';

const envSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  BEDROCK_MODEL_ID: z
    .string()
    .default('us.anthropic.claude-haiku-4-5-20251001-v1:0'),
  MCP_SERVER_URL: z.string().url('MCP_SERVER_URL must be a valid URL'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const env = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID,
    MCP_SERVER_URL: process.env.MCP_SERVER_URL,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function isEnvConfigured(): boolean {
  try {
    getEnv();
    return true;
  } catch {
    return false;
  }
}
