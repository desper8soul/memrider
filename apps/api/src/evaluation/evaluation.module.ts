import { Module } from '@nestjs/common';
import { JournalModule } from '@memrider/journal';
import { EvaluationController } from './evaluation.controller';

@Module({
  imports: [JournalModule],
  controllers: [EvaluationController],
})
export class EvaluationModule {}
