import { Injectable } from '@nestjs/common';

/** ~4 chars per token; target 200–500 tokens per chunk */
const MAX_CHARS = 2000;
const MIN_CHARS = 100;

@Injectable()
export class ChunkingService {
  /**
   * Deterministic local chunking: paragraphs first, then sentences.
   */
  chunk(text: string): string[] {
    const normalized = text.trim();
    if (!normalized) return [];

    if (normalized.length <= MAX_CHARS) {
      return [normalized];
    }

    const paragraphs = normalized
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let buffer = '';

    const flush = () => {
      const trimmed = buffer.trim();
      if (trimmed) chunks.push(trimmed);
      buffer = '';
    };

    for (const paragraph of paragraphs.length ? paragraphs : [normalized]) {
      if (paragraph.length > MAX_CHARS) {
        flush();
        for (const sentenceChunk of this.splitSentences(paragraph)) {
          if (buffer.length + sentenceChunk.length + 1 > MAX_CHARS) {
            flush();
          }
          buffer = buffer ? `${buffer} ${sentenceChunk}` : sentenceChunk;
          if (buffer.length >= MIN_CHARS && buffer.length >= MAX_CHARS * 0.8) {
            flush();
          }
        }
        continue;
      }

      if (buffer.length + paragraph.length + 2 > MAX_CHARS) {
        flush();
      }
      buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    }

    flush();
    return chunks.length ? chunks : [normalized];
  }

  private splitSentences(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
    const result: string[] = [];
    let buf = '';

    for (const s of sentences.map((x) => x.trim()).filter(Boolean)) {
      if (buf.length + s.length + 1 > MAX_CHARS) {
        if (buf) result.push(buf);
        if (s.length > MAX_CHARS) {
          for (let i = 0; i < s.length; i += MAX_CHARS) {
            result.push(s.slice(i, i + MAX_CHARS));
          }
          buf = '';
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
