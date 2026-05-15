import { Module } from '@nestjs/common';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { TaxCalculatorService } from './application/services/tax-calculator.service';
import { RevenueReportingService } from './application/services/revenue-reporting.service';
import { TaxController } from './presentation/tax.controller';

@Module({
  imports:     [PrismaModule],
  controllers: [TaxController],
  providers:   [TaxCalculatorService, RevenueReportingService],
  exports:     [TaxCalculatorService, RevenueReportingService],
})
export class TaxModule {}
