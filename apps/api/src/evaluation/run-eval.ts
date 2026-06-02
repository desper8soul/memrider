/**
 * CLI regression runner: retrieval metrics + schema/hallucination checks.
 * Usage: pnpm eval (requires DATABASE_URL and seeded data for live retrieval tests)
 */
import { loadEnv } from '@memrider/database';

loadEnv();

import { MemoryAnswerSchema } from '@memrider/shared';
import { EvaluationService } from './evaluation.service';
import { EmbeddingService } from '../embeddings/embedding.service';
import { RetrievalService } from '../retrieval/retrieval.service';
import { PrismaService } from '../database/prisma.service';
import retrievalFixture from './fixtures/retrieval-eval.json';

async function main() {
  const prisma = new PrismaService();
  await prisma.onModuleInit();

  const embeddings = new EmbeddingService();
  await embeddings.onModuleInit();

  const retrieval = new RetrievalService(prisma, embeddings);
  const evaluation = new EvaluationService(retrieval);

  const schemaSample = MemoryAnswerSchema.parse({
    answer: 'Test answer grounded in memory.',
    supportingChunkIds: ['chunk-1'],
    confidence: 'medium',
  });
  evaluation.validateStructuredOutput(schemaSample);
  console.log('✓ structured output schema validation');

  const hallucination = evaluation.checkHallucination(schemaSample, ['chunk-1']);
  if (!hallucination.valid) {
    throw new Error(hallucination.errors.join('; '));
  }
  console.log('✓ hallucination guard (valid references)');

  const bad = evaluation.checkHallucination(
    { ...schemaSample, supportingChunkIds: ['phantom'] },
    ['chunk-1'],
  );
  if (bad.valid) throw new Error('expected hallucination detection failure');
  console.log('✓ hallucination guard (rejects phantom chunk ids)');

  const cases = evaluation.parseDataset(retrievalFixture);
  if (process.env.RUN_LIVE_EVAL === '1') {
    const report = await evaluation.runRetrievalEval(cases, 5);
    console.log(`retrieval_hit_rate: ${report.retrievalHitRate}`);
    console.log(JSON.stringify(report.results, null, 2));
  } else {
    console.log('⊘ live retrieval eval skipped (set RUN_LIVE_EVAL=1 with seeded DB)');
  }

  await prisma.onModuleDestroy();
  console.log('Evaluation checks complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
