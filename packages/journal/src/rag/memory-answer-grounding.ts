import type { MemoryAnswer } from '@memrider/shared';

export interface HallucinationCheckResult {
  valid: boolean;
  errors: string[];
}

export function checkHallucination(
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

/** Drop invalid chunk ids and downgrade confidence when nothing retrieved supports the answer. */
export function sanitizeMemoryAnswer(
  answer: MemoryAnswer,
  allowedChunkIds: string[],
): MemoryAnswer {
  const allowed = new Set(allowedChunkIds);
  const supportingChunkIds = answer.supportingChunkIds.filter((id) =>
    allowed.has(id),
  );

  let confidence = answer.confidence;
  if (supportingChunkIds.length === 0) {
    confidence = 'low';
  }

  return {
    answer: answer.answer,
    supportingChunkIds,
    confidence,
  };
}
