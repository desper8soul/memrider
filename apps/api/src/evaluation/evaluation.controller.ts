import { Body, Controller, Post } from '@nestjs/common';
import { RetrievalEvalDatasetSchema } from '@memrider/shared';
import { EvaluationService } from './evaluation.service';

@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluation: EvaluationService) {}

  @Post('retrieval')
  async runRetrieval(
    @Body() body: { cases?: unknown; topK?: number },
  ) {
    const cases = body.cases
      ? this.evaluation.parseDataset(body.cases)
      : RetrievalEvalDatasetSchema.parse(
          await import('./fixtures/retrieval-eval.json').then((m) => m.default),
        );

    const report = await this.evaluation.runRetrievalEval(cases, body.topK ?? 5);
    return {
      metric: 'retrieval_hit_rate',
      retrievalHitRate: report.retrievalHitRate,
      results: report.results,
    };
  }
}
