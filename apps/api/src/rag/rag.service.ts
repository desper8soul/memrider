import { Injectable, Logger } from '@nestjs/common';
import { MemoryAnswer } from '@memrider/shared';
import { LlmService } from '../llm/llm.service';
import { PromptService } from '../prompts/prompt.service';
import { RetrievedChunk, RetrievalService } from '../retrieval/retrieval.service';

export interface RagPipelineLog {
  query: string;
  topK: number;
  promptName: string;
  promptVersion: string;
  retrievedChunkIds: string[];
  similarities: number[];
  systemPrompt: string;
  userPrompt: string;
  answer: MemoryAnswer;
  latencyMs: number;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly retrieval: RetrievalService,
    private readonly llm: LlmService,
    private readonly prompts: PromptService,
  ) {}

  async answer(query: string, topK = 5): Promise<{
    result: MemoryAnswer;
    retrieved: RetrievedChunk[];
    log: RagPipelineLog;
  }> {
    const started = Date.now();
    const retrieved = await this.retrieval.search(query, topK);
    const memories = this.formatMemories(retrieved);
    const resolved = this.prompts.resolveMemorySearchPrompt({ query, memories });
    const { parsed } = await this.llm.synthesize({
      system: resolved.system,
      user: resolved.user,
    });

    const log: RagPipelineLog = {
      query,
      topK,
      promptName: resolved.name,
      promptVersion: resolved.version,
      retrievedChunkIds: retrieved.map((c) => c.id),
      similarities: retrieved.map((c) => c.similarity),
      systemPrompt: resolved.system,
      userPrompt: resolved.user,
      answer: parsed,
      latencyMs: Date.now() - started,
    };

    this.logger.log(JSON.stringify(log));
    return { result: parsed, retrieved, log };
  }

  private formatMemories(chunks: RetrievedChunk[]): string {
    if (!chunks.length) return '(no memories retrieved)';

    return chunks
      .map(
        (c) =>
          `--- Memory chunk_id: ${c.id} (entry: ${c.entryId}, ${c.createdAt.toISOString()}, similarity: ${c.similarity.toFixed(4)}) ---\n${c.content}`,
      )
      .join('\n\n');
  }
}
