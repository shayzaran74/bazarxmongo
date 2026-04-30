// apps/backend/src/modules/commerce/commerce.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { FinancialGatewayModule } from '../financial-gateway/financial-gateway.module';
import { CatalogModule } from '../catalog/catalog.module';

// Controllers
import { CartController } from './presentation/cart.controller';
import { CheckoutController } from './presentation/checkout.controller';
import { PaymentController } from './presentation/payment.controller';
import { OrderAdminController } from './presentation/order-admin.controller';
import { OrderController } from './presentation/order.controller';

// Services
import { PricingService } from './application/services/pricing.service';
import { CheckoutService } from './application/services/checkout.service';
import { StorageService } from './application/services/storage.service';
import { InvoicePdfService } from './application/services/invoice-pdf.service';
import { OrderExpiryService } from './application/services/order-expiry.service';

// Command handlers
import { CheckoutHandler } from './application/commands/checkout.handler';
import { AddToCartHandler } from './application/commands/add-to-cart.handler';
import { UpdateCartItemHandler } from './application/commands/update-cart-item.handler';
import { RemoveCartItemHandler } from './application/commands/remove-cart-item.handler';
import { ClearCartHandler } from './application/commands/clear-cart.handler';
import { GenerateInvoiceHandler } from './application/commands/generate-invoice.handler';
import { MergeCartHandler } from './application/commands/merge-cart.handler';

// Query handlers
import { GetCartHandler } from './application/queries/get-cart.handler';
import { ListAdminOrdersHandler } from './application/queries/list-admin-orders.handler';
import { GetAdminOrderHandler } from './application/queries/get-admin-order.handler';

// Repositories — sadece token olarak kayıtlı, sınıf tekrarı yok
import { PrismaCartRepository } from './infrastructure/persistence/prisma-cart.repository';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { PrismaInvoiceRepository } from './infrastructure/persistence/prisma-invoice.repository';

const CommandHandlers = [
  CheckoutHandler,
  AddToCartHandler,
  UpdateCartItemHandler,
  RemoveCartItemHandler,
  ClearCartHandler,
  GenerateInvoiceHandler,
  MergeCartHandler,
];

const QueryHandlers = [
  GetCartHandler,
  ListAdminOrdersHandler,
  GetAdminOrderHandler,
];

const Repositories = [
  { provide: 'ICartRepository', useClass: PrismaCartRepository },
  { provide: 'IOrderRepository', useClass: PrismaOrderRepository },
  { provide: 'IInvoiceRepository', useClass: PrismaInvoiceRepository },
];

@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    FinancialGatewayModule,
    CatalogModule,
  ],
  controllers: [
    CartController,
    CheckoutController,
    PaymentController,
    OrderAdminController,
    OrderController,
  ],
  providers: [
    PricingService,
    CheckoutService,
    StorageService,
    InvoicePdfService,
    OrderExpiryService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
  ],
  exports: [
    ...Repositories,
    StorageService,
  ],
})
export class CommerceModule {}
