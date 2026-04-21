// apps/backend/src/modules/commerce/commerce.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CartController } from './presentation/cart.controller';
import { CheckoutController } from './presentation/checkout.controller';
import { PaymentController } from './presentation/payment.controller';
import { OrderAdminController } from './presentation/order-admin.controller';
import { PricingService } from './application/services/pricing.service';
import { CheckoutService } from './application/services/checkout.service';
import { CheckoutHandler } from './application/commands/checkout.handler';
import { AddToCartHandler } from './application/commands/add-to-cart.handler';
import { UpdateCartItemHandler } from './application/commands/update-cart-item.handler';
import { RemoveCartItemHandler } from './application/commands/remove-cart-item.handler';
import { ClearCartHandler } from './application/commands/clear-cart.handler';
import { GetCartHandler } from './application/queries/get-cart.handler';
import { ListAdminOrdersHandler } from './application/queries/list-admin-orders.handler';
import { PrismaCartRepository } from './infrastructure/persistence/prisma-cart.repository';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { FinancialGatewayModule } from '../financial-gateway/financial-gateway.module';
import { CatalogModule } from '../catalog/catalog.module';

const CommandHandlers = [
  CheckoutHandler,
  AddToCartHandler,
  UpdateCartItemHandler,
  RemoveCartItemHandler,
  ClearCartHandler,
];
const QueryHandlers = [
  GetCartHandler,
  ListAdminOrdersHandler,
];
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
  controllers: [CartController, CheckoutController, PaymentController, OrderAdminController],
  providers: [
    PricingService,
    CheckoutService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    PrismaCartRepository,
    PrismaOrderRepository,
  ],
  exports: [...Repositories],
})
export class CommerceModule {}
