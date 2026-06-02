import { Injectable } from '@nestjs/common';
import {
  MemoryAnswerSchema,
  RetrievalEvalDatasetSchema,
  type MemoryAnswer,
  type RetrievalEvalCase,
} from '@memrider/shared';
import { RetrievalService } from '../retrieval/retrieval.service';

export interface RetrievalEvalResult {
  query: string;
  expectedChunkIds: string[];
  retrievedChunkIds: string[];
  hit: boolean;
}

export interface HallucinationCheckResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class EvaluationService {
  constructor(private readonly retrieval: RetrievalService) {}

  async runRetrievalEval(
    cases: RetrievalEvalCase[],
    topK = 5,
  ): Promise<{
    results: RetrievalEvalResult[];
    retrievalHitRate: number;
  }> {
    const results: RetrievalEvalResult[] = [];

    for (const c of cases) {
      const retrieved = await this.retrieval.search(c.query, topK);
      const retrievedChunkIds = retrieved.map((r) => r.id);
      const hit = c.expectedChunkIds.some((id) => retrievedChunkIds.includes(id));
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
    const errors: string[] = [];
    const allowed = new Set(allowedChunkIds);

    for (const id of answer.supportingChunkIds) {
      if (!allowed.has(id)) {
        errors.push(`supportingChunkId "${id}" was not in retrieved context`);
      }
    }

    if (answer.supportingChunkIds.length === 0 && answer.confidence !== 'low') {
      errors.push('high/medium confidence requires at least one supporting chunk');
    }

    return { valid: errors.length === 0, errors };
  }

  validateStructuredOutput(raw: unknown): MemoryAnswer {
    return MemoryAnswerSchema.parse(raw);
  }

  parseDataset(raw: unknown) {
    return RetrievalEvalDatasetSchema.parse(raw);
  }
}
