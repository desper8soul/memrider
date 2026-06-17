import { Injectable } from "@nestjs/common";
import { SearchResponseSchema } from "@memrider/shared";
import { RagService } from "../rag/rag.service";

@Injectable()
export class SearchService {
  constructor(private readonly ragService: RagService) {}

  async search(query: string, topK = 5) {
    const { result, retrieved, log } = await this.ragService.answer(
      query,
      topK,
    );

    return SearchResponseSchema.parse({
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
    });
  }
}
