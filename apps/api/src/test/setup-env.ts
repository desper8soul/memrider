import { getDefaultPromptsDir } from '@memrider/journal';

/**
 * Required env for scripts that load AppConfig (eval, etc.).
 */
const requiredTestEnv: Record<string, string> = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://memrider:memrider@localhost:5432/memrider?schema=public',
  PORT: '3001',
  CORS_ORIGIN: 'http://localhost:3000',
  EMBEDDING_MODEL_ID: 'Xenova/all-MiniLM-L6-v2',
  EMBEDDING_DIMENSION: '384',
  EMBEDDING_QUANTIZED: 'true',
  AWS_REGION: 'us-east-1',
  BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0',
  AWS_BEARER_TOKEN_BEDROCK: 'test-bedrock-token',
  AWS_AUTH_SCHEME_PREFERENCE: 'httpBearerAuth',
  PROMPT_SET_NAME: 'memory-search',
  PROMPT_VERSION: 'v1',
  PROMPTS_DIR: getDefaultPromptsDir(),
  RUN_LIVE_EVAL: 'false',
};

for (const [key, value] of Object.entries(requiredTestEnv)) {
  process.env[key] ??= value;
}
