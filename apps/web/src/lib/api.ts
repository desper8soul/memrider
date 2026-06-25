import {
  CreateEntryResponseSchema,
  CreateEntrySchema,
  JournalEntryListItemSchema,
  SearchQuerySchema,
  SearchResponseSchema,
  type CreateEntryResponse,
  type JournalEntryListItem,
  type SearchResponse,
} from '@memrider/shared/schemas';

const API_BASE = '/api/memrider';

export async function createEntry(content: string): Promise<CreateEntryResponse> {
  const body = CreateEntrySchema.parse({ content });
  const res = await fetch(`${API_BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return CreateEntryResponseSchema.parse(await res.json());
}

export async function listEntries(): Promise<JournalEntryListItem[]> {
  const res = await fetch(`${API_BASE}/entries`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  const data: unknown = await res.json();
  return JournalEntryListItemSchema.array().parse(data);
}

export async function searchMemories(
  query: string,
  topK = 5,
): Promise<SearchResponse> {
  const body = SearchQuerySchema.parse({ query, topK });
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return SearchResponseSchema.parse(await res.json());
}
