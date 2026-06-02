CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chunks" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "embedding" vector(384),
    CONSTRAINT "chunks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chunks_entry_id_idx" ON "chunks"("entry_id");

CREATE INDEX "chunks_embedding_hnsw_idx"
ON "chunks"
USING hnsw ("embedding" vector_cosine_ops);

ALTER TABLE "chunks" ADD CONSTRAINT "chunks_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
