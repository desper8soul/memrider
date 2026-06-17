import { describe, expect, it } from 'vitest';
import { applyChunkOverlap } from './chunk-overlap.util';

/**
 * Overlap is easiest to read with tiny sizes:
 *   max=2, overlap=1  →  keep at most 2 chars per base chunk, share 1 char across the boundary.
 *
 * applyChunkOverlap runs *after* base chunks exist; it only adjusts how chunk N+1 starts.
 */
describe('applyChunkOverlap', () => {
  it('returns a single chunk unchanged', () => {
    expect(applyChunkOverlap(['only'], 1)).toEqual(['only']);
  });

  it('returns input unchanged when overlap is 0', () => {
    expect(applyChunkOverlap(['AB', 'CD'], 0)).toEqual(['AB', 'CD']);
  });

  describe('different characters at the boundary — tail is prepended', () => {
    it('ABC split as AB | C  →  AB | BC  (overlap 1)', () => {
      // Chunk 1 ends with "B", chunk 2 is "C" → prepend "B"
      expect(applyChunkOverlap(['AB', 'C'], 1)).toEqual(['AB', 'BC']);
    });

    it('hello | world with overlap 2  →  hello | loworld', () => {
      // Tail "lo", next "world" does not start with "lo"
      expect(applyChunkOverlap(['hello', 'world'], 2)).toEqual(['hello', 'loworld']);
    });
  });

  describe('same substring already at the start — no extra prefix', () => {
    it('XXX split as XX | X  →  XX | X  (not XX | XX)', () => {
      // Tail of "XX" is "X"; next chunk is already "X" → startsWith → skip prepend
      expect(applyChunkOverlap(['XX', 'X'], 1)).toEqual(['XX', 'X']);
    });

    it('ZZZZ split as ZZ | ZZ | ZZ  →  unchanged (each next part already starts with tail Z)', () => {
      expect(applyChunkOverlap(['ZZ', 'ZZ', 'ZZ'], 1)).toEqual(['ZZ', 'ZZ', 'ZZ']);
    });
  });

  describe('readable picture (max=2, overlap=1)', () => {
    it('ABC: windows share the boundary letter in chunk 2', () => {
      const base = ['AB', 'C']; // from hard split before overlap
      const withOverlap = applyChunkOverlap(base, 1);

      expect(withOverlap[0]).toBe('AB');
      expect(withOverlap[1]).toBe('BC'); // B from chunk1 + C from chunk2
      expect(withOverlap[1]![0]).toBe(base[0]!.at(-1)); // shared edge char
    });

    it('XXX: same letter on the edge — chunk 2 is not lengthened', () => {
      const base = ['XX', 'X'];
      const withOverlap = applyChunkOverlap(base, 1);

      expect(withOverlap).toEqual(['XX', 'X']);
      expect(withOverlap[1]).toBe(base[1]); // still one X, not XX
    });
  });
});
