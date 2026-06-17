import { describe, expect, it } from 'vitest';
import {
  CHUNK_MAX_CHARS,
  CHUNK_OVERLAP_CHARS,
} from './chunking.constants';
import { ChunkingService } from './chunking.service';

describe('ChunkingService (full pipeline)', () => {
  const chunking = new ChunkingService();

  it('returns no chunks for whitespace-only input', () => {
    expect(chunking.chunk('   \n\n  ')).toEqual([]);
  });

  it('keeps text within CHUNK_MAX_CHARS as one chunk (no overlap step)', () => {
    const text = 'Rainy morning. Skipped the run.';
    expect(chunking.chunk(text)).toEqual([text]);
  });

  it('merges paragraphs that fit within CHUNK_MAX_CHARS', () => {
    const a = 'A'.repeat(900);
    const b = 'B'.repeat(900);
    const text = `${a}\n\n${b}`;
    expect(chunking.chunk(text)).toEqual([`${a}\n\n${b}`]);
  });

  it('splits two large paragraphs and applies production overlap (A… then B…)', () => {
    const a = 'A'.repeat(1200);
    const b = 'B'.repeat(1200);
    const chunks = chunking.chunk(`${a}\n\n${b}`);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe(a);
    // Different letters at boundary → 100-char tail of A prepended to B
    expect(chunks[1]).toBe(`${a.slice(-CHUNK_OVERLAP_CHARS)}${b}`);
  });

  it('hard-splits repeated Z without lengthening the second chunk (same edge char)', () => {
    const chunks = chunking.chunk('Z'.repeat(3000));

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe('Z'.repeat(CHUNK_MAX_CHARS));
    expect(chunks[1]).toBe('Z'.repeat(1000));
    expect(chunks[1]!.length).toBeLessThan(CHUNK_MAX_CHARS);
  });

  it('each chunk after the first starts with the previous chunk tail (production overlap)', () => {
    const body = `${'S'.repeat(400)}. `.repeat(30);
    const chunks = chunking.chunk(body);

    for (let i = 1; i < chunks.length; i++) {
      const tail = chunks[i - 1]!.slice(-CHUNK_OVERLAP_CHARS);
      expect(chunks[i]!.startsWith(tail) || tail.length === 0).toBe(true);
    }
  });
});
