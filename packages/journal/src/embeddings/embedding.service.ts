import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '@memrider/shared';
import { AppLogger } from '@memrider/shared/logging';
import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly context = EmbeddingService.name;
  private extractor: FeatureExtractionPipeline | null = null;
  private modelId!: string;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit() {
    const { modelId, quantized } = this.appConfigService.embeddings;
    this.modelId = modelId;

    this.logger.log(`Loading embedding model: ${modelId} (quantized=${quantized})`, this.context);

    this.extractor = await pipeline('feature-extraction', modelId, {
      quantized,
    });

    this.logger.log('Embedding model ready', this.context);
  }

  async embed(text: string): Promise<number[]> {
    if (!this.extractor) {
      throw new Error('Embedding model not initialized');
    }
    const output = await this.extractor(text, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(output.data as Float32Array);
  }

  toVectorLiteral(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }
}
