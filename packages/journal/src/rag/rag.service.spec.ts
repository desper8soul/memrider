import { describe, expect, it, vi } from 'vitest';
import { createMockAppLogger } from '../test/mock-app-logger';
import { RagService } from './rag.service';

describe('RagService', () => {
  it('skips LLM when retrieval returns no chunks', async () => {
    const retrievalService = { search: vi.fn().mockResolvedValue([]) };
    const llmService = { synthesize: vi.fn() };
    const promptService = {
      getPromptSetName: () => 'memory-search',
      getActiveVersion: () => 'v1',
      getPrompt: vi.fn(),
    };

    const rag = new RagService(
      retrievalService as never,
      llmService as never,
      promptService as never,
      createMockAppLogger(),
    );

    const { result, retrieved } = await rag.answer('user-1', 'When was I happy?', 5);

    expect(retrieved).toEqual([]);
    expect(result.confidence).toBe('low');
    expect(result.supportingChunkIds).toEqual([]);
    expect(llmService.synthesize).not.toHaveBeenCalled();
    expect(promptService.getPrompt).not.toHaveBeenCalled();
  });

  it('sanitizes LLM chunk references to retrieved ids only', async () => {
    const retrieved = [
      {
        id: 'c1',
        entryId: 'e1',
        content: 'Felt calm.',
        index: 0,
        similarity: 0.9,
        createdAt: new Date('2024-06-01'),
      },
    ];
    const retrievalService = { search: vi.fn().mockResolvedValue(retrieved) };
    const llmService = {
      synthesize: vi.fn().mockResolvedValue({
        parsed: {
          answer: 'You were calm.',
          supportingChunkIds: ['c1', 'phantom'],
          confidence: 'high',
        },
      }),
    };
    const promptService = {
      getPromptSetName: () => 'memory-search',
      getActiveVersion: () => 'v1',
      getPrompt: vi.fn().mockReturnValue({
        name: 'memory-search',
        version: 'v1',
        system: 'sys',
        user: 'user',
      }),
    };

    const rag = new RagService(
      retrievalService as never,
      llmService as never,
      promptService as never,
      createMockAppLogger(),
    );

    const { result } = await rag.answer('user-1', 'mood?', 5);

    expect(result.supportingChunkIds).toEqual(['c1']);
    expect(result.confidence).toBe('high');
  });
});
