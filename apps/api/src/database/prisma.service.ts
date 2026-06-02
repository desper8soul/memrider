import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { getPrisma, PrismaClient } from '@memrider/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private _client?: PrismaClient;

  get client(): PrismaClient {
    if (!this._client) {
      this._client = getPrisma();
    }
    return this._client;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
