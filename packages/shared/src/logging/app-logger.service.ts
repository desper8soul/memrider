import { ConsoleLogger, Injectable, type LoggerService } from '@nestjs/common';

/**
 * Application-wide logging facade. Swap the internal sink (e.g. Pino, Winston)
 * without changing feature services.
 */
@Injectable()
export class AppLogger implements LoggerService {
  private readonly sink = new ConsoleLogger();

  log(message: unknown, context?: string): void {
    this.sink.log(this.format(message), context);
  }

  warn(message: unknown, context?: string): void {
    this.sink.warn(this.format(message), context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    if (trace !== undefined && context !== undefined) {
      this.sink.error(this.format(message), trace, context);
      return;
    }
    if (trace !== undefined) {
      this.sink.error(this.format(message), trace);
      return;
    }
    this.sink.error(this.format(message));
  }

  private format(message: unknown): string {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }
}
