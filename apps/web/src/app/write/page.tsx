'use client';

import { useState } from 'react';
import { createEntry } from '@/lib/api';

export default function WritePage() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const result = await createEntry(content);
      setStatus(`Saved entry ${result.id} (${result.chunkIds.length} chunks indexed)`);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Write memory</h1>
      <p className="lead">
        Journal entries are chunked locally, embedded with MiniLM, and stored in pgvector.
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={12}
          placeholder="What happened today? Long entries are split into semantic chunks..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit" disabled={loading || !content.trim()}>
          {loading ? 'Indexing…' : 'Save entry'}
        </button>
      </form>
      {status && <p className="meta">{status}</p>}
      {error && <p className="error">{error}</p>}
    </>
  );
}
