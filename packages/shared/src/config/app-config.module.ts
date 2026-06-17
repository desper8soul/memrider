import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ZodError } from 'zod';

import { appConfigSchema } from './app-config.schema';
import { AppConfigService } from './app-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: (config) => {
        try {
          return appConfigSchema.parse(config);
        } catch (error) {
          if (!(error instanceof ZodError)) {
            throw error;
          }
          const issues = error.issues.map(
            (issue) => `${issue.path.join('.')}: ${issue.message}`,
          );
          throw new Error(`Config validation failed:\n${issues.join('\n')}`);
        }
      },
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
