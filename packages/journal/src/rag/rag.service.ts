import { Injectable } from "@nestjs/common";
import { MemoryAnswer } from "@memrider/shared";
import { AppLogger } from "@memrider/shared/logging";
import { LlmService } from "../llm/llm.service";
import { PromptService } from "../prompts/prompt.service";
import {
  RetrievedChunk,
  RetrievalService,
} from "../retrieval/retrieval.service";
import {
  checkHallucination,
  sanitizeMemoryAnswer,
} from "./memory-answer-grounding";

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

const EMPTY_INDEX_ANSWER: MemoryAnswer = {
  answer:
    "I do not have any indexed memories to answer that yet. Write a journal entry first.",
  supportingChunkIds: [],
  confidence: "low",
};

const LOG_TEXT_MAX_CHARS = 200;

function truncateForLog(text: string, max = LOG_TEXT_MAX_CHARS): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}… (${text.length} chars)`;
}

@Injectable()
export class RagService {
  private readonly context = RagService.name;

  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly llmService: LlmService,
    private readonly promptService: PromptService,
    private readonly logger: AppLogger,
  ) {}

  async answer(
    query: string,
    topK = 5,
  ): Promise<{
    result: MemoryAnswer;
    retrieved: RetrievedChunk[];
    log: RagPipelineLog;
  }> {
    const started = Date.now();
    const retrieved = await this.retrievalService.search(query, topK);

    if (!retrieved.length) {
      const log = this.buildLog({
        query,
        topK,
        retrieved,
        started,
        answer: EMPTY_INDEX_ANSWER,
        systemPrompt: "",
        userPrompt: "",
      });

      this.logger.log(this.formatLogLine(log), this.context);

      return { result: EMPTY_INDEX_ANSWER, retrieved, log };
    }

    const memories = this.formatMemories(retrieved);

    const prompt = this.promptService.getPrompt({
      query,
      memories,
    });

    const { parsed } = await this.llmService.synthesize({
      system: prompt.system,
      user: prompt.user,
    });

    const allowedChunkIds = retrieved.map((c) => c.id);
    const hallucination = checkHallucination(parsed, allowedChunkIds);

    if (!hallucination.valid) {
      this.logger.warn(
        `Answer grounding: ${hallucination.errors.join("; ")}`,
        this.context,
      );
    }

    const result = sanitizeMemoryAnswer(parsed, allowedChunkIds);

    const log = this.buildLog({
      query,
      topK,
      retrieved,
      started,
      answer: result,
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      promptName: prompt.name,
      promptVersion: prompt.version,
    });

    this.logger.log(this.formatLogLine(log), this.context);

    return { result, retrieved, log };
  }

  private formatLogLine(log: RagPipelineLog): string {
    return JSON.stringify({
      query: log.query,
      topK: log.topK,
      promptName: log.promptName,
      promptVersion: log.promptVersion,
      retrievedChunkIds: log.retrievedChunkIds,
      similarities: log.similarities,
      systemPrompt: truncateForLog(log.systemPrompt),
      userPrompt: truncateForLog(log.userPrompt),
      answer: {
        ...log.answer,
        answer: truncateForLog(log.answer.answer),
      },
      latencyMs: log.latencyMs,
    });
  }

  private buildLog(input: {
    query: string;
    topK: number;
    retrieved: RetrievedChunk[];
    started: number;
    answer: MemoryAnswer;
    systemPrompt: string;
    userPrompt: string;
    promptName?: string;
    promptVersion?: string;
  }): RagPipelineLog {
    return {
      query: input.query,
      topK: input.topK,
      promptName: input.promptName ?? this.promptService.getPromptSetName(),
      promptVersion:
        input.promptVersion ?? this.promptService.getActiveVersion(),
      retrievedChunkIds: input.retrieved.map((c) => c.id),
      similarities: input.retrieved.map((c) => c.similarity),
      systemPrompt: input.systemPrompt,
      userPrompt: input.userPrompt,
      answer: input.answer,
      latencyMs: Date.now() - input.started,
    };
  }

  private formatMemories(chunks: RetrievedChunk[]): string {
    return chunks
      .map(
        (c) =>
          `--- Memory chunk_id: ${c.id} (entry: ${c.entryId}, ${c.createdAt.toISOString()}, similarity: ${c.similarity.toFixed(4)}) ---\n${c.content}`,
      )
      .join("\n\n");
  }
}
