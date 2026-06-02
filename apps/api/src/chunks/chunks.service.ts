import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from '../embeddings/embedding.service';

@Injectable()
export class ChunksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chunking: ChunkingService,
    private readonly embeddings: EmbeddingService,
  ) {}

  async createForEntry(entryId: string, content: string): Promise<string[]> {
    const texts = this.chunking.chunk(content);
    const chunkIds: string[] = [];

    for (let index = 0; index < texts.length; index++) {
      const chunk = await this.prisma.client.chunk.create({
        data: { entryId, content: texts[index], index },
      });
      chunkIds.push(chunk.id);

      const vector = await this.embeddings.embed(texts[index]);
      const literal = this.embeddings.toVectorLiteral(vector);
      await this.prisma.client.$executeRaw`
        UPDATE chunks SET embedding = ${literal}::vector WHERE id = ${chunk.id}
      `;
    }

    return chunkIds;
  }
}
