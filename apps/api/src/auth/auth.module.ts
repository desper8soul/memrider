import { Module } from '@nestjs/common';
import { AuthModule as MemriderAuthModule } from '@memrider/auth';
import { AuthController } from './auth.controller';

@Module({
  imports: [MemriderAuthModule],
  controllers: [AuthController],
})
export class AuthModule {}
