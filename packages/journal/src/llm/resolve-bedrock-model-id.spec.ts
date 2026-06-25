import { describe, expect, it } from 'vitest';
import {
  AwsRegion,
  BedrockModelId,
  resolveBedrockInvokeModelId,
} from '@memrider/shared';

describe('resolveBedrockInvokeModelId', () => {
  it('maps Nova Lite foundation model to EU inference profile', () => {
    expect(
      resolveBedrockInvokeModelId(
        AwsRegion.EuCentral1,
        BedrockModelId.NovaLiteV1,
      ),
    ).toBe(BedrockModelId.EuNovaLiteV1);
  });

  it('maps Nova Lite foundation model to US inference profile', () => {
    expect(
      resolveBedrockInvokeModelId(AwsRegion.UsEast1, BedrockModelId.NovaLiteV1),
    ).toBe(BedrockModelId.UsNovaLiteV1);
  });

  it('passes through explicit inference profile IDs', () => {
    expect(
      resolveBedrockInvokeModelId(
        AwsRegion.EuCentral1,
        BedrockModelId.EuNovaLiteV1,
      ),
    ).toBe(BedrockModelId.EuNovaLiteV1);
  });
});
