/**
 * CLI regression runner: retrieval metrics + schema/hallucination checks.
 * Usage: pnpm eval (requires DATABASE_URL and seeded data for live retrieval tests)
 */
import { loadEnv } from '@memrider/database';
import { PrismaModule } from '@memrider/database/lib';
import { EvaluationService, JournalModule } from '@memrider/journal';
import { AppConfigService } from '@memrider/shared';
import {
  AppLogger,
  createStandaloneAppLogger,
  LoggerModule,
} from '@memrider/shared/logging';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

loadEnv();

import retrievalFixture from './fixtures/retrieval-eval.json';

@Module({
  imports: [LoggerModule, JournalModule, PrismaModule],
})
class EvalCliModule {}

async function main() {
  const app = await NestFactory.createApplicationContext(EvalCliModule, {
    logger: false,
  });
  const logger = app.get(AppLogger);
  const appConfigService = app.get(AppConfigService);
  const evaluationService = app.get(EvaluationService);

  const schemaSampleRaw = {
    answer: 'Test answer grounded in memory.',
    supportingChunkIds: ['chunk-1'],
    confidence: 'medium',
  };

  const schemaSample = evaluationService.validateStructuredOutput(schemaSampleRaw);

  logger.log('✓ structured output schema validation', 'EvalCli');

  const hallucination = evaluationService.checkHallucination(schemaSample, ['chunk-1']);

  if (!hallucination.valid) {
    throw new Error(hallucination.errors.join('; '));
  }

  logger.log('✓ hallucination guard (valid references)', 'EvalCli');

  const bad = evaluationService.checkHallucination(
    { ...schemaSample, supportingChunkIds: ['phantom'] },
    ['chunk-1'],
  );

  if (bad.valid) throw new Error('expected hallucination detection failure');

  logger.log('✓ hallucination guard (rejects phantom chunk ids)', 'EvalCli');

  const cases = evaluationService.parseDataset(retrievalFixture);

  if (appConfigService.evaluation.runLiveEval) {
    const report = await evaluationService.runRetrievalEval(cases, 5);
    logger.log(`retrieval_hit_rate: ${report.retrievalHitRate}`, 'EvalCli');
    logger.log(JSON.stringify(report.results, null, 2), 'EvalCli');

    if (report.retrievalHitRate < 1) {
      const misses = report.results.filter((r) => !r.hit);
      throw new Error(
        `Retrieval eval failed: hit rate ${report.retrievalHitRate} (${misses.length}/${report.results.length} misses)`,
      );
    }
  } else {
    logger.log(
      '⊘ live retrieval eval skipped (set RUN_LIVE_EVAL=1 with seeded DB)',
      'EvalCli',
    );
  }

  await app.close();
  logger.log('Evaluation checks complete.', 'EvalCli');
}

main().catch((err) => {
  const message = err instanceof Error ? err.stack ?? err.message : String(err);
  createStandaloneAppLogger().error(message, undefined, 'EvalCli');
  process.exit(1);
});
