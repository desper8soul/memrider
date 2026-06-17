import { describe, expect, it } from 'vitest';
import type { RetrievedChunk } from './retrieval.service';
import {
  dedupeRetrievedByEntry,
  retrievalCandidateLimit,
} from './retrieval.util';

function chunk(
  id: string,
  entryId: string,
  similarity: number,
): RetrievedChunk {
  return {
    id,
    entryId,
    content: id,
    index: 0,
    similarity,
    createdAt: new Date(),
  };
}

describe('retrieval.util', () => {
  it('retrievalCandidateLimit scales with topK capped at 100', () => {
    expect(retrievalCandidateLimit(5)).toBe(25);
    expect(retrievalCandidateLimit(30)).toBe(100);
  });

  it('dedupeRetrievedByEntry keeps best chunk per entry', () => {
    const input = [
      chunk('a1', 'entry-a', 0.9),
      chunk('a2', 'entry-a', 0.85),
      chunk('b1', 'entry-b', 0.8),
      chunk('c1', 'entry-c', 0.7),
    ];
    const deduped = dedupeRetrievedByEntry(input, 2);
    expect(deduped.map((c) => c.id)).toEqual(['a1', 'b1']);
    expect(deduped.map((c) => c.entryId)).toEqual(['entry-a', 'entry-b']);
  });
});
