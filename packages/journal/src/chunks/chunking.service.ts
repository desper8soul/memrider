import { Injectable } from "@nestjs/common";
import { applyChunkOverlap } from "./chunk-overlap.util";
import {
  CHUNK_MAX_CHARS,
  CHUNK_MIN_CHARS,
  CHUNK_OVERLAP_CHARS,
} from "./chunking.constants";

@Injectable()
export class ChunkingService {
  /**
   * Deterministically split journal text into chunks for embedding.
   * 1) Trim; if ≤ max chars → one chunk.
   * 2) Pack paragraphs (split on blank lines); flush when the next would exceed max.
   * 3) Oversized paragraphs → sentence splits, then hard slices at max.
   * 4) applyChunkOverlap prepends the prior tail onto the next chunk when edge text differs.
   */
  chunk(text: string): string[] {
    const normalized = text.trim();
    if (!normalized) return [];

    if (normalized.length <= CHUNK_MAX_CHARS) {
      return [normalized];
    }

    const paragraphs = normalized
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let buffer = "";

    const flush = () => {
      const trimmed = buffer.trim();

      if (trimmed) chunks.push(trimmed);

      buffer = "";
    };

    // The ternary guards the rare case where that pipeline yields [] but normalized is non-empty
    for (const paragraph of paragraphs.length ? paragraphs : [normalized]) {
      if (paragraph.length > CHUNK_MAX_CHARS) {
        flush();

        for (const sentenceChunk of this.splitSentences(paragraph)) {
          if (buffer.length + sentenceChunk.length + 1 > CHUNK_MAX_CHARS) {
            flush();
          }

          buffer = buffer ? `${buffer} ${sentenceChunk}` : sentenceChunk;

          if (
            buffer.length >= CHUNK_MIN_CHARS &&
            buffer.length >= CHUNK_MAX_CHARS * 0.8
          ) {
            flush();
          }
        }

        continue;
      }

      if (buffer.length + paragraph.length + 2 > CHUNK_MAX_CHARS) {
        flush();
      }

      buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    }

    flush();

    const base = chunks.length ? chunks : [normalized];

    return applyChunkOverlap(base, CHUNK_OVERLAP_CHARS);
  }

  private splitSentences(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
    const result: string[] = [];
    let buf = "";

    for (const s of sentences.map((x) => x.trim()).filter(Boolean)) {
      if (buf.length + s.length + 1 > CHUNK_MAX_CHARS) {
        if (buf) result.push(buf);
        if (s.length > CHUNK_MAX_CHARS) {
          for (let i = 0; i < s.length; i += CHUNK_MAX_CHARS) {
            result.push(s.slice(i, i + CHUNK_MAX_CHARS));
          }
          buf = "";
        } else {
          buf = s;
        }
      } else {
        buf = buf ? `${buf} ${s}` : s;
      }
    }

    if (buf) result.push(buf);

    return result;
  }
}
