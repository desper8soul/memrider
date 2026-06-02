import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmbeddingService } from '../embeddings/embedding.service';

export interface RetrievedChunk {
  id: string;
  entryId: string;
  content: string;
  index: number;
  similarity: number;
  createdAt: Date;
}

@Injectable()
export class RetrievalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingService,
  ) {}

  async search(query: string, topK = 5): Promise<RetrievedChunk[]> {
    const vector = await this.embeddings.embed(query);
    const literal = this.embeddings.toVectorLiteral(vector);

    const rows = await this.prisma.client.$queryRaw<
      Array<{
        id: string;
        entry_id: string;
        content: string;
        index: number;
        similarity: number;
        createdAt: Date;
      }>
    >`
      SELECT
        c.id,
        c.entry_id,
        c.content,
        c.index,
        1 - (c.embedding <=> ${literal}::vector) AS similarity,
        e."createdAt" AS "createdAt"
      FROM chunks c
      JOIN journal_entries e ON e.id = c.entry_id
      WHERE c.embedding IS NOT NULL
      ORDER BY c.embedding <=> ${literal}::vector
      LIMIT ${topK}
    `;

    return rows.map((r: (typeof rows)[number]) => ({
      id: r.id,
      entryId: r.entry_id,
      content: r.content,
      index: r.index,
      similarity: Number(r.similarity),
      createdAt: r.createdAt,
    }));
  }
}
