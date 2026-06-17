/**
 * After base chunking, duplicate the tail of chunk N at the start of chunk N+1
 * so a query that sits on the boundary can match both vectors.
 */
export function applyChunkOverlap(
  chunks: string[],
  overlapChars: number,
): string[] {
  if (overlapChars <= 0 || chunks.length <= 1) {
    return chunks;
  }

  const result: string[] = [chunks[0]];

  for (let i = 1; i < chunks.length; i++) {
    const prev = chunks[i - 1];
    const current = chunks[i];
    const suffix = prev.slice(Math.max(0, prev.length - overlapChars));

    // Same letters at the edge (e.g. tail "X" and next chunk "X") — already aligned.
    if (!suffix || current.startsWith(suffix)) {
      result.push(current);
      continue;
    }

    result.push(suffix + current);
  }

  return result;
}
