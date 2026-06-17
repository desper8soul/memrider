import { loadEnv } from '@memrider/database';
import { AppConfigService } from '@memrider/shared';
import { AppLogger } from '@memrider/shared/logging';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

loadEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  app.useLogger(logger); // So Nest's internal logs goes to our logger

  const appConfigService = app.get(AppConfigService);

  app.enableCors({ origin: appConfigService.api.corsOrigin });

  const { port } = appConfigService.api;
  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
