export enum NodeEnvironment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export enum AwsRegion {
  EuCentral1 = "eu-central-1",
  UsEast1 = "us-east-1",
  UsWest2 = "us-west-2",
}

/** Must match Prisma `vector(...)` column size in migrations. */
export enum EmbeddingDimension {
  Dim384 = "384",
}

export enum EmbeddingModelId {
  XenovaMiniLmL6V2 = "Xenova/all-MiniLM-L6-v2",
}

export enum BooleanEnv {
  True = "true",
  False = "false",
}

export enum AwsAuthSchemePreference {
  HttpBearerAuth = "httpBearerAuth",
}

export enum BedrockModelId {
  NovaLiteV1 = "amazon.nova-lite-v1:0",
}

export enum PromptSetName {
  MemorySearch = "memory-search",
}

export enum PromptVersion {
  V1 = "v1",
}
