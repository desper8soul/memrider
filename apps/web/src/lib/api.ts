const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function createEntry(content: string) {
  const res = await fetch(`${API_URL}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listEntries() {
  const res = await fetch(`${API_URL}/entries`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchMemories(query: string, topK = 5) {
  const res = await fetch(`${API_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
