import { Module } from '@nestjs/common';
import { RetrievalService } from '../retrieval/retrieval.service';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';

@Module({
  controllers: [EvaluationController],
  providers: [EvaluationService, RetrievalService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
