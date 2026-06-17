import { Module } from '@nestjs/common';
import { JournalModule } from '@memrider/journal';
import { EntriesController } from './entries.controller';

@Module({
  imports: [JournalModule],
  controllers: [EntriesController],
})
export class EntriesModule {}
