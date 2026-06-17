import {
  BedrockRuntimeClient,
  ConverseCommand,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { Injectable } from '@nestjs/common';
import { AppConfigService, MemoryAnswerSchema } from '@memrider/shared';
import { AppLogger } from '@memrider/shared/logging';

export interface LlmSynthesisInput {
  system: string;
  user: string;
}

@Injectable()
export class LlmService {
  private readonly context = LlmService.name;
  private client: BedrockRuntimeClient | null = null;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly logger: AppLogger,
  ) {
    const { region, bearerToken, authSchemePreference } = this.appConfigService.bedrock;

    this.client = new BedrockRuntimeClient({
      region,
      token: async () => ({ token: bearerToken }),
      authSchemePreference: [authSchemePreference],
    });
    this.logger.log(`Bedrock client ready (region=${region}, bearer auth)`, this.context);
  }

  async synthesize(input: LlmSynthesisInput): Promise<{
    raw: string;
    parsed: ReturnType<typeof MemoryAnswerSchema.parse>;
  }> {
    const { modelId } = this.appConfigService.bedrock;

    const raw = this.client
      ? await this.invokeBedrock(modelId, input)
      : this.mockResponse(input.user);

    const json = this.extractJson(raw);
    const parsed = MemoryAnswerSchema.parse(json);
    return { raw, parsed };
  }

  private async invokeBedrock(
    modelId: string,
    input: LlmSynthesisInput,
  ): Promise<string> {
    if (this.isNovaModel(modelId)) {
      return this.invokeNovaConverse(modelId, input);
    }
    return this.invokeAnthropic(modelId, input);
  }

  private isNovaModel(modelId: string): boolean {
    return modelId.includes('nova');
  }

  private async invokeNovaConverse(
    modelId: string,
    input: LlmSynthesisInput,
  ): Promise<string> {
    const command = new ConverseCommand({
      modelId,
      system: [{ text: input.system }],
      messages: [
        {
          role: 'user',
          content: [{ text: input.user }],
        },
      ],
      inferenceConfig: {
        maxTokens: 1024,
        temperature: 0.2,
      },
    });

    const response = await this.client!.send(command);
    const text = response.output?.message?.content?.[0]?.text;
    if (!text) {
      throw new Error('Bedrock Converse returned empty text');
    }
    return text;
  }

  private async invokeAnthropic(
    modelId: string,
    input: LlmSynthesisInput,
  ): Promise<string> {
    const body = JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      system: input.system,
      messages: [{ role: 'user', content: input.user }],
    });

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: Buffer.from(body),
    });

    const response = await this.client!.send(command);
    const decoded = JSON.parse(Buffer.from(response.body!).toString('utf-8'));
    const text =
      decoded.content?.[0]?.text ??
      decoded.generation ??
      JSON.stringify(decoded);
    return text;
  }

  private mockResponse(userPrompt: string): string {
    this.logger.warn('Bedrock unavailable — using deterministic mock LLM', this.context);
    const chunkIdMatch = userPrompt.match(/chunk_id:\s*(\S+)/g);
    const ids = chunkIdMatch?.map((m) => m.replace('chunk_id:', '').trim()) ?? [];

    const hasContext = userPrompt.includes('--- Memory');
    const answer = hasContext
      ? 'Based on the retrieved memories, here is what your past self recorded. (Mock synthesis — configure AWS for Bedrock.)'
      : 'I do not have enough memory context to answer that question.';

    return JSON.stringify({
      answer,
      supportingChunkIds: ids.slice(0, 3),
      confidence: hasContext ? 'medium' : 'low',
    });
  }

  private extractJson(text: string): unknown {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = fenced?.[1]?.trim() ?? text.trim();
    try {
      return JSON.parse(candidate);
    } catch {
      const start = candidate.indexOf('{');
      const end = candidate.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(candidate.slice(start, end + 1));
      }
      throw new Error('LLM response is not valid JSON');
    }
  }
}
