import { Module } from '@nestjs/common';
import { JournalModule } from '@memrider/journal';
import { SearchController } from './search.controller';

@Module({
  imports: [JournalModule],
  controllers: [SearchController],
})
export class SearchModule {}
