import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';
export const EMBEDDING_DIMENSION = 384;

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private extractor: FeatureExtractionPipeline | null = null;

  async onModuleInit() {
    this.logger.log(`Loading embedding model: ${MODEL_ID}`);
    this.extractor = await pipeline('feature-extraction', MODEL_ID, {
      quantized: true,
    });
    this.logger.log('Embedding model ready');
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
