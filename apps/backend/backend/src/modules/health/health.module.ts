// apps/backend/src/modules/health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MediaModule } from '../media/media.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, MediaModule],
  controllers: [HealthController],
})
export class HealthModule {}
