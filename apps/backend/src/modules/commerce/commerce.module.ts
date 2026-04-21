// apps/backend/src/modules/commerce/commerce.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CartController } from './presentation/cart.controller';
import { CheckoutController } from './presentation/checkout.controller';
import { PaymentController } from './presentation/payment.controller';
import { OrderAdminController } from './presentation/order-admin.controller';
import { PricingService } from './application/services/pricing.service';
import { CheckoutService } from './application/services/checkout.service';
import { StorageService } from './application/services/storage.service';
import { InvoicePdfService } from './application/services/invoice-pdf.service';
import { CheckoutHandler } from './application/commands/checkout.handler';
import { AddToCartHandler } from './application/commands/add-to-cart.handler';
import { UpdateCartItemHandler } from './application/commands/update-cart-item.handler';
import { RemoveCartItemHandler } from './application/commands/remove-cart-item.handler';
import { ClearCartHandler } from './application/commands/clear-cart.handler';
import { GenerateInvoiceHandler } from './application/commands/generate-invoice.handler';
import { GetCartHandler } from './application/queries/get-cart.handler';
import { ListAdminOrdersHandler } from './application/queries/list-admin-orders.handler';
import { PrismaCartRepository } from './infrastructure/persistence/prisma-cart.repository';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { PrismaInvoiceRepository } from './infrastructure/persistence/prisma-invoice.repository';
import { FinancialGatewayModule } from '../financial-gateway/financial-gateway.module';
import { CatalogModule } from '../catalog/catalog.module';

const CommandHandlers = [
  CheckoutHandler,
  AddToCartHandler,
  UpdateCartItemHandler,
  RemoveCartItemHandler,
  ClearCartHandler,
  GenerateInvoiceHandler,
];
const QueryHandlers = [
  GetCartHandler,
  ListAdminOrdersHandler,
];
const Repositories = [
  { provide: 'ICartRepository', useClass: PrismaCartRepository },
  { provide: 'IOrderRepository', useClass: PrismaOrderRepository },
  { provide: 'IInvoiceRepository', useClass: PrismaInvoiceRepository },
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
    StorageService,
    InvoicePdfService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    PrismaCartRepository,
    PrismaOrderRepository,
    PrismaInvoiceRepository,
  ],
  exports: [
    ...Repositories,
    StorageService,
  ],
})
export class CommerceModule {}
