import { z } from "zod";

import {
  AwsAuthSchemePreference,
  AwsRegion,
  BedrockModelId,
  BooleanEnv,
  EmbeddingDimension,
  EmbeddingModelId,
  NodeEnvironment,
  PromptSetName,
  PromptVersion,
} from "./app-config.enum";

const requiredBooleanEnv = z
  .nativeEnum(BooleanEnv)
  .transform((value) => value === BooleanEnv.True);

const embeddingDimensionEnv = z
  .nativeEnum(EmbeddingDimension)
  .transform((value) => Number(value));

const portEnv = z
  .string()
  .min(1)
  .transform((value) => parseInt(value, 10))
  .refine((port) => Number.isInteger(port) && port > 0, {
    message: "PORT must be a positive integer",
  });

export const appConfigSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnvironment),
  DATABASE_URL: z.string().min(1),
  PORT: portEnv,
  CORS_ORIGIN: z.string().min(1),

  EMBEDDING_MODEL_ID: z.nativeEnum(EmbeddingModelId),
  EMBEDDING_DIMENSION: embeddingDimensionEnv,
  EMBEDDING_QUANTIZED: requiredBooleanEnv,

  AWS_REGION: z.nativeEnum(AwsRegion),
  BEDROCK_MODEL_ID: z.nativeEnum(BedrockModelId),
  AWS_BEARER_TOKEN_BEDROCK: z.string().min(1),
  AWS_AUTH_SCHEME_PREFERENCE: z.nativeEnum(AwsAuthSchemePreference),

  PROMPT_SET_NAME: z.nativeEnum(PromptSetName),
  PROMPT_VERSION: z.nativeEnum(PromptVersion),
  PROMPTS_DIR: z.string().min(1),

  RUN_LIVE_EVAL: requiredBooleanEnv,
});

export type AppConfig = z.infer<typeof appConfigSchema>;
