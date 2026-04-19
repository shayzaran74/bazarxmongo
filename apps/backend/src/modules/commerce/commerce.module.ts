// apps/backend/src/modules/commerce/commerce.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CartController } from './presentation/cart.controller';
import { CheckoutController } from './presentation/checkout.controller';
import { PaymentController } from './presentation/payment.controller';
import { PricingService } from './application/services/pricing.service';
import { CheckoutService } from './application/services/checkout.service';
import { CheckoutHandler } from './application/commands/checkout.handler';
import { PrismaCartRepository } from './infrastructure/persistence/prisma-cart.repository';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { FinancialGatewayModule } from '../financial-gateway/financial-gateway.module';
import { CatalogModule } from '../catalog/catalog.module';

const CommandHandlers = [CheckoutHandler];
const Repositories = [
  { provide: 'ICartRepository', useClass: PrismaCartRepository },
  { provide: 'IOrderRepository', useClass: PrismaOrderRepository },
];

@Module({
  imports: [
    CqrsModule,
    FinancialGatewayModule,
    CatalogModule,
  ],
  controllers: [CartController, CheckoutController, PaymentController],
  providers: [
    PricingService,
    CheckoutService,
    ...CommandHandlers,
    ...Repositories,
    PrismaCartRepository,
    PrismaOrderRepository,
  ],
  exports: [...Repositories],
})
export class CommerceModule {}
