# Database migrations (Prisma + pgvector)

Use **Prisma Migrate** for normal schema changes. Use **hand-written SQL** for anything Prisma cannot express in `schema.prisma`.

## What Prisma owns

- Models, columns, relations, enums
- Regular B-tree indexes (`@@index`, `@@unique`)
- `prisma generate` client

## What SQL migrations own (not in schema)

- `CREATE EXTENSION vector`
- HNSW / IVFFlat indexes on `embedding` (`Unsupported("vector(384)")`)

Prisma does not model HNSW indexes. If you run `prisma migrate dev` and accept every diff blindly, it may generate `DROP INDEX "chunks_embedding_hnsw_idx"` as “drift.” **Do not apply that.**

## Recommended workflow

### 1. Change the Prisma schema

Edit `prisma/schema.prisma` (new field, model, `@@index` on normal columns).

### 2. Create migration without applying (review first)

```bash
cd packages/database
npx prisma migrate dev --create-only --name describe_your_change
```

Open the new `prisma/migrations/<timestamp>_describe_your_change/migration.sql`.

### 3. Edit the SQL before applying

- **Remove** any `DROP INDEX` on `chunks_embedding_hnsw_idx` (unless you really intend to drop it).
- **Add** pgvector/HNSW SQL here if needed (see `20250520100000_init` or `restore_chunks_embedding_hnsw_idx`).

### 4. Apply

```bash
npx prisma migrate dev
```

Or in CI/production:

```bash
npx prisma migrate deploy
```

### 5. Regenerate client

```bash
pnpm db:generate
```

## Adding or fixing the vector index

Keep this in a dedicated migration file, not in `schema.prisma`:

```sql
CREATE INDEX IF NOT EXISTS "chunks_embedding_hnsw_idx"
ON "chunks"
USING hnsw ("embedding" vector_cosine_ops);
```

## What to avoid

| Approach | Use when |
|----------|----------|
| `prisma migrate dev` (default) | Schema changes — **review generated SQL** |
| `prisma migrate dev` + accept all drift | **Avoid** — drops HNSW |
| `prisma db push` | Quick throwaway local DB only — no versioned history |
| No migrations | Not recommended for this project |

## Check status

```bash
npx prisma migrate status
```

## Folder names

Migration directory names are part of history (`20260521082614_add_entry_tags`). Renaming folders after apply breaks Prisma’s match with `_prisma_migrations` — don’t rename applied migrations; add a new one instead.
