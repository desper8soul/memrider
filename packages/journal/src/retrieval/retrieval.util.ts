import type { RetrievedChunk } from "./retrieval.service";

/** Extra neighbors fetched before keeping at most one chunk per journal entry. */
export const RETRIEVAL_CANDIDATE_MULTIPLIER = 5;

export function retrievalCandidateLimit(topK: number): number {
  return Math.min(Math.max(topK * RETRIEVAL_CANDIDATE_MULTIPLIER, topK), 100);
}

/** Keep the best-ranked chunk per entry (input must already be ordered by similarity desc).
 *  Problem this solves: Overlap makes adjacent chunks especially likely to rank together.
 */
export function dedupeRetrievedByEntry(
  chunks: RetrievedChunk[],
  limit: number,
): RetrievedChunk[] {
  const seenEntryIds = new Set<string>();
  const result: RetrievedChunk[] = [];

  for (const chunk of chunks) {
    if (seenEntryIds.has(chunk.entryId)) continue;

    seenEntryIds.add(chunk.entryId);
    result.push(chunk);

    if (result.length >= limit) break;
  }

  return result;
}
