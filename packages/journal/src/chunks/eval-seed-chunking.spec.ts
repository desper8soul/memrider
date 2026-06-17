import { describe, expect, it } from "vitest";
import { ChunkingService } from "./chunking.service";
import { CHUNK_MAX_CHARS } from "./chunking.constants";

/**
 * Minimal multi-paragraph text that forces 4 chunks.
 * Mirrors the structure of eval-seed-data.ts: conference-retro-week.
 * Kept here so packages/journal does not import across the package boundary.
 */
const PAD =
  " I kept the conference badge in my wallet as a reminder to finish the eval harness.";

function padTo(text: string, min: number): string {
  let s = text.trim();
  while (s.length < min) s += PAD;
  return s;
}

const CONFERENCE_FIXTURE = [
  padTo(
    "[memrider-seed:conference-retro-week] Conference week — travel and opening day. " +
      "Travel in was a mess: flight delayed, hotel after midnight. The keynote pushed eval harnesses " +
      "as part of the product, not a side repo.",
    1250,
  ),
  padTo(
    "Midweek workshops on retrieval metrics clicked for me on Wednesday. " +
      "Hit rate alone hides almost-right failures; I should track MRR or nDCG when we have ranked lists.",
    1250,
  ),
  padTo(
    "Thursday dinner with the Postgres folks was useful. " +
      "They nudged me to tune pgvector HNSW per dataset size before the next migration.",
    1250,
  ),
  padTo(
    "Friday demo day went fine until Q&A surfaced that we have no story for memory deletion; " +
      "action item is a one-pager on retention and export before we call the product trustworthy.",
    1250,
  ),
].join("\n\n");

describe("eval seed chunking", () => {
  const chunking = new ChunkingService();

  it("splits multi-paragraph conference entry into 4 chunks", () => {
    const paragraphs = CONFERENCE_FIXTURE.split(/\n\s*\n/);
    expect(paragraphs.length).toBe(4);
    paragraphs.forEach((p) => expect(p.length).toBeLessThanOrEqual(CHUNK_MAX_CHARS));

    const chunks = chunking.chunk(CONFERENCE_FIXTURE);
    expect(chunks.length).toBe(4);

    expect(chunks[0]).toMatch(/conference-retro-week/);
    expect(chunks[1]).toMatch(/hit rate/i);
    expect(chunks[1]).toContain("nDCG");
    expect(chunks[2]).toContain("pgvector HNSW");
    expect(chunks[3]).toMatch(/memory deletion/i);
  });
});
