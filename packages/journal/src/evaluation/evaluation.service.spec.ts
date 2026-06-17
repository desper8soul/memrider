import { describe, expect, it } from 'vitest';
import { EvaluationService } from './evaluation.service';

describe('EvaluationService', () => {
  const evaluationService = new EvaluationService(null as never);

  it('validates structured output', () => {
    const parsed = evaluationService.validateStructuredOutput({
      answer: 'I felt calm.',
      supportingChunkIds: ['c1'],
      confidence: 'high',
    });
    expect(parsed.confidence).toBe('high');
  });

  it('detects unsupported chunk references', () => {
    const result = evaluationService.checkHallucination(
      {
        answer: 'I was ecstatic.',
        supportingChunkIds: ['not-retrieved'],
        confidence: 'high',
      },
      ['c1', 'c2'],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('passes when supporting ids are in context', () => {
    const result = evaluationService.checkHallucination(
      {
        answer: 'I felt calm.',
        supportingChunkIds: ['c1'],
        confidence: 'medium',
      },
      ['c1', 'c2'],
    );
    expect(result.valid).toBe(true);
  });
});
