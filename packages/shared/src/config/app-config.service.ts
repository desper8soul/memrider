import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppConfig } from "./app-config.schema";

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  get api() {
    return {
      port: this.configService.get("PORT", { infer: true }),
      corsOrigin: this.configService.get("CORS_ORIGIN", { infer: true }),
      nodeEnvironment: this.configService.get("NODE_ENV", { infer: true }),
    };
  }

  get database() {
    return {
      url: this.configService.get("DATABASE_URL", { infer: true }),
    };
  }

  get embeddings() {
    return {
      modelId: this.configService.get("EMBEDDING_MODEL_ID", { infer: true }),
      dimension: this.configService.get("EMBEDDING_DIMENSION", { infer: true }),
      quantized: this.configService.get("EMBEDDING_QUANTIZED", { infer: true }),
    };
  }

  get bedrock() {
    return {
      region: this.configService.get("AWS_REGION", { infer: true }),
      modelId: this.configService.get("BEDROCK_MODEL_ID", { infer: true }),
      bearerToken: this.configService.get("AWS_BEARER_TOKEN_BEDROCK", {
        infer: true,
      }),
      authSchemePreference: this.configService.get(
        "AWS_AUTH_SCHEME_PREFERENCE",
        {
          infer: true,
        },
      ),
    };
  }

  get prompts() {
    return {
      promptSetName: this.configService.get("PROMPT_SET_NAME", { infer: true }),
      promptVersion: this.configService.get("PROMPT_VERSION", { infer: true }),
      promptsDir: this.configService.get("PROMPTS_DIR", { infer: true }),
    };
  }

  get evaluation() {
    return {
      runLiveEval: this.configService.get("RUN_LIVE_EVAL", { infer: true }),
    };
  }

  get auth() {
    return {
      provider: this.configService.get("AUTH_PROVIDER", { infer: true }),
      cognito: {
        userPoolId: this.configService.get("COGNITO_USER_POOL_ID", {
          infer: true,
        }),
        clientId: this.configService.get("COGNITO_CLIENT_ID", {
          infer: true,
        }),
      },
    };
  }
}
