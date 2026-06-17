'use client';

import { useState } from 'react';
import type { SearchResponse } from '@memrider/shared/schemas';
import { searchMemories } from '@/lib/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await searchMemories(query);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Search memories</h1>
      <p className="lead">
        Semantic retrieval over your journal, then Bedrock synthesis with structured output.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="How did I feel during the Maldives trip?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Ask past self'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="card">
            <strong>Answer</strong>
            <span className="badge">{result.confidence}</span>
            <p>{result.answer}</p>
            <p className="meta">
              Supporting: {result.supportingChunkIds.join(', ') || 'none'} ·{' '}
              {result.meta.latencyMs}ms
            </p>
          </div>
          <h2 style={{ fontSize: '1rem', margin: '1rem 0 0.5rem' }}>Retrieved chunks</h2>
          {result.retrieved.map((c) => (
            <div key={c.id} className="card">
              <p className="meta">
                {c.id} · similarity {(c.similarity * 100).toFixed(1)}%
              </p>
              <p>{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
