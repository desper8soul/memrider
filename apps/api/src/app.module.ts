import { Module } from '@nestjs/common';
import { JournalModule } from '@memrider/journal';
import { AppConfigModule } from '@memrider/shared/config';
import { LoggerModule } from '@memrider/shared/logging';
import { AuthModule } from './auth/auth.module';
import { EntriesModule } from './entries/entries.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    AuthModule,
    JournalModule,
    EntriesModule,
    SearchModule,
  ],
})
export class AppModule {}
