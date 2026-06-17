import { Injectable } from '@nestjs/common';
import { PrismaService } from '@memrider/database/lib';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from '../embeddings/embedding.service';

@Injectable()
export class ChunksService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingsService: EmbeddingService,
  ) {}

  async createForEntry(entryId: string, content: string): Promise<string[]> {
    const texts = this.chunkingService.chunk(content);
    const chunkIds: string[] = [];

    for (let index = 0; index < texts.length; index++) {
      const chunk = await this.prismaService.client.chunk.create({
        data: { entryId, content: texts[index], index },
      });
      chunkIds.push(chunk.id);

      const vector = await this.embeddingsService.embed(texts[index]);
      const literal = this.embeddingsService.toVectorLiteral(vector);
      await this.prismaService.client.$executeRaw`
        UPDATE chunks SET embedding = ${literal}::vector WHERE id = ${chunk.id}
      `;
    }

    return chunkIds;
  }
}
