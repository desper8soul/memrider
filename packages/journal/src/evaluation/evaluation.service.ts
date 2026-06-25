import { Injectable } from "@nestjs/common";
import {
  MemoryAnswerSchema,
  RetrievalEvalDatasetSchema,
  type MemoryAnswer,
  type RetrievalEvalCase,
} from "@memrider/shared";
import { RetrievalService } from '../retrieval/retrieval.service';
import { EVAL_SEED_USER_ID } from './eval.constants';
import {
  checkHallucination as checkHallucinationGuard,
  type HallucinationCheckResult,
} from '../rag/memory-answer-grounding';

export interface RetrievalEvalResult {
  query: string;
  expectedChunkIds: string[];
  retrievedChunkIds: string[];
  hit: boolean;
}

export type { HallucinationCheckResult };

@Injectable()
export class EvaluationService {
  constructor(private readonly retrievalService: RetrievalService) {}

  async runRetrievalEval(
    cases: RetrievalEvalCase[],
    topK = 5,
  ): Promise<{
    results: RetrievalEvalResult[];
    retrievalHitRate: number;
  }> {
    const results: RetrievalEvalResult[] = [];

    for (const c of cases) {
      const retrieved = await this.retrievalService.search(
        EVAL_SEED_USER_ID,
        c.query,
        topK,
      );
      const retrievedChunkIds = retrieved.map((r) => r.id);
      const hit = c.expectedChunkIds.some((id) =>
        retrievedChunkIds.includes(id),
      );
      results.push({
        query: c.query,
        expectedChunkIds: c.expectedChunkIds,
        retrievedChunkIds,
        hit,
      });
    }

    const hits = results.filter((r) => r.hit).length;
    return {
      results,
      retrievalHitRate: cases.length ? hits / cases.length : 0,
    };
  }

  checkHallucination(
    answer: MemoryAnswer,
    allowedChunkIds: string[],
  ): HallucinationCheckResult {
    return checkHallucinationGuard(answer, allowedChunkIds);
  }

  validateStructuredOutput(raw: unknown): MemoryAnswer {
    return MemoryAnswerSchema.parse(raw);
  }

  parseDataset(raw: unknown) {
    return RetrievalEvalDatasetSchema.parse(raw);
  }
}
