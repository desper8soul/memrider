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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function createEntry(content: string): Promise<CreateEntryResponse> {
  const body = CreateEntrySchema.parse({ content });
  const res = await fetch(`${API_URL}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return CreateEntryResponseSchema.parse(await res.json());
}

export async function listEntries(): Promise<JournalEntryListItem[]> {
  const res = await fetch(`${API_URL}/entries`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  const data: unknown = await res.json();
  return JournalEntryListItemSchema.array().parse(data);
}

export async function searchMemories(
  query: string,
  topK = 5,
): Promise<SearchResponse> {
  const body = SearchQuerySchema.parse({ query, topK });
  const res = await fetch(`${API_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return SearchResponseSchema.parse(await res.json());
}
