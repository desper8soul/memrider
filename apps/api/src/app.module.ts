import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { PromptsModule } from './prompts/prompts.module';
import { EntriesModule } from './entries/entries.module';
import { SearchModule } from './search/search.module';
import { EvaluationModule } from './evaluation/evaluation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    EmbeddingsModule,
    PromptsModule,
    EntriesModule,
    SearchModule,
    EvaluationModule,
  ],
})
export class AppModule {}
