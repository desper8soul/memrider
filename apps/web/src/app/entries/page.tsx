'use client';

import { useEffect, useState } from 'react';
import type { JournalEntryListItem } from '@memrider/shared/schemas';
import { listEntries } from '@/lib/api';

export default function EntriesPage() {
  const [entries, setEntries] = useState<JournalEntryListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEntries()
      .then(setEntries)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load entries'),
      );
  }, []);

  return (
    <>
      <h1>Entries</h1>
      <p className="lead">All journal entries stored in PostgreSQL.</p>
      {error && <p className="error">{error}</p>}
      {!error && entries.length === 0 && (
        <p className="meta">No entries yet. Write one first.</p>
      )}
      {entries.map((e) => (
        <div key={e.id} className="card">
          <p className="meta">
            {new Date(e.createdAt).toLocaleString()} · {e.chunkCount} chunks
          </p>
          <p>{e.content.length > 400 ? `${e.content.slice(0, 400)}…` : e.content}</p>
        </div>
      ))}
    </>
  );
}
