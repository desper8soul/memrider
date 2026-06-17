import { Body, Controller, Post } from '@nestjs/common';
import { RetrievalEvalDatasetSchema } from '@memrider/shared';
import { EvaluationService } from '@memrider/journal';

@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post('retrieval')
  async runRetrieval(
    @Body() body: { cases?: unknown; topK?: number },
  ) {
    const cases = body.cases
      ? this.evaluationService.parseDataset(body.cases)
      : RetrievalEvalDatasetSchema.parse(
          await import('./fixtures/retrieval-eval.json').then((m) => m.default),
        );

    const report = await this.evaluationService.runRetrievalEval(cases, body.topK ?? 5);
    return {
      metric: 'retrieval_hit_rate',
      retrievalHitRate: report.retrievalHitRate,
      results: report.results,
    };
  }
}
