import { describe, expect, it } from 'vitest';
import { checkHallucination, sanitizeMemoryAnswer } from './memory-answer-grounding';

describe('memory-answer-grounding', () => {
  it('checkHallucination rejects phantom chunk ids', () => {
    const result = checkHallucination(
      {
        answer: 'I was ecstatic.',
        supportingChunkIds: ['phantom'],
        confidence: 'high',
      },
      ['c1'],
    );
    expect(result.valid).toBe(false);
  });

  it('sanitizeMemoryAnswer strips invalid ids and lowers confidence', () => {
    const sanitized = sanitizeMemoryAnswer(
      {
        answer: 'Mixed refs.',
        supportingChunkIds: ['c1', 'phantom'],
        confidence: 'high',
      },
      ['c1'],
    );
    expect(sanitized.supportingChunkIds).toEqual(['c1']);
    expect(sanitized.confidence).toBe('high');
  });

  it('sanitizeMemoryAnswer forces low confidence when no valid ids remain', () => {
    const sanitized = sanitizeMemoryAnswer(
      {
        answer: 'No grounding.',
        supportingChunkIds: ['phantom'],
        confidence: 'high',
      },
      ['c1'],
    );
    expect(sanitized.supportingChunkIds).toEqual([]);
    expect(sanitized.confidence).toBe('low');
  });
});
