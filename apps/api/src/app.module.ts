import { Module } from '@nestjs/common';
import { JournalModule } from '@memrider/journal';
import { LoggerModule } from '@memrider/shared/logging';
import { EntriesModule } from './entries/entries.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [LoggerModule, JournalModule, EntriesModule, SearchModule, EvaluationModule],
})
export class AppModule {}
