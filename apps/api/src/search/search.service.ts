import { Injectable } from '@nestjs/common';
import { RagService } from '../rag/rag.service';

@Injectable()
export class SearchService {
  constructor(private readonly rag: RagService) {}

  async search(query: string, topK = 5) {
    const { result, retrieved, log } = await this.rag.answer(query, topK);
    return {
      answer: result.answer,
      supportingChunkIds: result.supportingChunkIds,
      confidence: result.confidence,
      retrieved: retrieved.map((c) => ({
        id: c.id,
        entryId: c.entryId,
        content: c.content,
        similarity: c.similarity,
        createdAt: c.createdAt,
      })),
      meta: {
        latencyMs: log.latencyMs,
        retrievedChunkIds: log.retrievedChunkIds,
        promptName: log.promptName,
        promptVersion: log.promptVersion,
      },
    };
  }
}
