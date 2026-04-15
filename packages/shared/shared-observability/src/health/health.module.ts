// packages/shared/shared-observability/src/health/health.module.ts

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule],
  exports: [TerminusModule],
})
export class HealthModule {}
