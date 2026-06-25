import { match } from "ts-pattern";

import { AwsRegion, BedrockModelId } from "../config/common/app-config.enum";

function resolveNovaLiteProfileForRegion(region: AwsRegion): BedrockModelId {
  return match(region)
    .with(AwsRegion.EuCentral1, () => BedrockModelId.EuNovaLiteV1)
    .with(AwsRegion.UsEast1, () => BedrockModelId.UsNovaLiteV1)
    .with(AwsRegion.UsWest2, () => BedrockModelId.UsNovaLiteV1)
    .exhaustive();
}

/**
 * Bedrock Nova models in most regions require an inference profile ID, not the
 * foundation model ID, for on-demand Converse/Invoke calls.
 */
export function resolveBedrockInvokeModelId(
  region: AwsRegion,
  modelId: BedrockModelId,
): BedrockModelId {
  return match(modelId)
    .with(BedrockModelId.EuNovaLiteV1, (profileId) => profileId)
    .with(BedrockModelId.UsNovaLiteV1, (profileId) => profileId)
    .with(BedrockModelId.NovaLiteV1, () =>
      resolveNovaLiteProfileForRegion(region),
    )
    .exhaustive();
}
