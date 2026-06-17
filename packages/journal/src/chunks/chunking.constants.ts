/** ~4 chars per token; target 200–500 tokens per chunk */
export const CHUNK_MAX_CHARS = 2000;
export const CHUNK_MIN_CHARS = 100;
/** Tail of chunk N prepended to chunk N+1 so boundary queries match both sides */
export const CHUNK_OVERLAP_CHARS = 100;
