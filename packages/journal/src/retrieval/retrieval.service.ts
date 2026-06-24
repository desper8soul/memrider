import { Injectable } from '@nestjs/common';
import { PrismaService } from '@memrider/database/lib';
import { EmbeddingService } from '../embeddings/embedding.service';
import {
  dedupeRetrievedByEntry,
  retrievalCandidateLimit,
} from './retrieval.util';

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
    private readonly prismaService: PrismaService,
    private readonly embeddingsService: EmbeddingService,
  ) {}

  async search(userId: string, query: string, topK = 5): Promise<RetrievedChunk[]> {
    const vector = await this.embeddingsService.embed(query);
    const literal = this.embeddingsService.toVectorLiteral(vector);
    const candidateLimit = retrievalCandidateLimit(topK);

    const rows = await this.prismaService.client.$queryRaw<
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
        AND e.user_id = ${userId}
      ORDER BY c.embedding <=> ${literal}::vector
      LIMIT ${candidateLimit}
    `;

    const ranked = rows.map((r: (typeof rows)[number]) => ({
      id: r.id,
      entryId: r.entry_id,
      content: r.content,
      index: r.index,
      similarity: Number(r.similarity),
      createdAt: r.createdAt,
    }));

    return dedupeRetrievedByEntry(ranked, topK);
  }
}
