// apps/backend/src/modules/commerce/commerce.module.ts
// CommerceModule — Mongoose migration (ADR-005 Faz 2a)

import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { FinancialGatewayModule } from '../financial-gateway/financial-gateway.module';
import { CatalogModule } from '../catalog/catalog.module';
import { VendorModule } from '../vendor/vendor.module';
import { AuditMongooseModule } from '../audit/audit-mongoose.module';

// Schemas
import { Cart, CartSchema } from '@barterborsa/shared-persistence/schemas/backend/cart.schema';
import { CartItem, CartItemSchema } from '@barterborsa/shared-persistence/schemas/backend/cartItem.schema';
import { Order, OrderSchema } from '@barterborsa/shared-persistence/schemas/backend/order.schema';
import { Invoice, InvoiceSchema } from '@barterborsa/shared-persistence/schemas/backend/invoice.schema';
import { InvoiceItem, InvoiceItemSchema } from '@barterborsa/shared-persistence/schemas/backend/invoiceItem.schema';
import { Dispute, DisputeSchema } from '@barterborsa/shared-persistence/schemas/backend/dispute.schema';
import { EscrowCoupon, EscrowCouponSchema } from '@barterborsa/shared-persistence/schemas/backend/escrowCoupon.schema';
import { Coupon, CouponSchema } from '@barterborsa/shared-persistence/schemas/backend/coupon.schema';
import { ReturnRequest, ReturnRequestSchema } from '@barterborsa/shared-persistence';
import { MongoVendorRepository } from '../vendor/infrastructure/persistence/mongo-vendor.repository';
import { MongoListingRepository } from '../catalog/infrastructure/persistence/mongo-listing.repository';

// Controllers
import { CartController } from './presentation/cart.controller';
import { CheckoutController } from './presentation/checkout.controller';
import { PaymentController } from './presentation/payment.controller';
import { OrderAdminController } from './presentation/order-admin.controller';
import { OrderController } from './presentation/order.controller';
import { ReturnController } from './presentation/return.controller';
import { EInvoiceController, OrderEInvoiceController, AdminEInvoiceController } from './presentation/einvoice.controller';

// Services
import { PricingService } from './application/services/pricing.service';
import { CheckoutService } from './application/services/checkout.service';
import { StorageService } from './application/services/storage.service';
import { InvoicePdfService } from './application/services/invoice-pdf.service';
import { OrderExpiryService } from './application/services/order-expiry.service';
import { OrderEscrowWorker } from './application/services/order-escrow-worker.service';
import { ReturnService } from './application/services/return.service';
import { ReturnSchedulerService } from './application/services/return-scheduler.service';
import { EInvoiceGeneratorService } from './application/services/einvoice-generator.service';
import { OrderDeliveredConsumer } from './application/consumers/order-delivered.consumer';
import { EfaturaComAdapter } from './infrastructure/adapters/efatura-com.adapter';

// Command handlers
import { CheckoutHandler } from './application/commands/checkout.handler';
import { AddToCartHandler } from './application/commands/add-to-cart.handler';
import { UpdateCartItemHandler } from './application/commands/update-cart-item.handler';
import { RemoveCartItemHandler } from './application/commands/remove-cart-item.handler';
import { ClearCartHandler } from './application/commands/clear-cart.handler';
import { GenerateInvoiceHandler } from './application/commands/generate-invoice.handler';
import { MergeCartHandler } from './application/commands/merge-cart.handler';
import { OpenOrderDisputeHandler } from './application/commands/open-order-dispute.handler';
import { ResolveOrderDisputeHandler } from './application/commands/resolve-order-dispute.handler';
import { MarkOrderPreparingHandler } from './application/commands/mark-order-preparing.handler';
import { MarkOrderReadyHandler } from './application/commands/mark-order-ready.handler';
import { ShipOrderItemHandler } from './application/commands/ship-order-item.handler';
import { UpdateOrderStatusHandler } from './application/commands/update-order-status.handler';
import { BulkUpdateOrderStatusHandler } from './application/commands/bulk-update-order-status.handler';
import { CancelOrderAdminHandler } from './application/commands/cancel-order-admin.handler';

// Query handlers
import { GetCartHandler } from './application/queries/get-cart.handler';
import { ListAdminOrdersHandler } from './application/queries/list-admin-orders.handler';
import { GetAdminOrderHandler } from './application/queries/get-admin-order.handler';
import { GetMyOrdersHandler } from './application/queries/get-my-orders.handler';
import { GetOrderDetailsHandler } from './application/queries/get-order-details.handler';

// Infrastructure
import { MongoCartRepository } from './infrastructure/persistence/mongo-cart.repository';
import { MongoOrderRepository } from './infrastructure/persistence/mongo-order.repository';
import { MongoInvoiceRepository } from './infrastructure/persistence/mongo-invoice.repository';
import { MongoDisputeRepository } from './infrastructure/persistence/mongo-dispute.repository';
import { MongoUserAddressRepository } from './infrastructure/persistence/mongo-user-address.repository';
import { MongoCouponRepository, MongoEscrowCouponRepository } from './infrastructure/persistence/mongo-coupon.repository';
import { MongoReturnRequestRepository } from './infrastructure/persistence/mongo-return-request.repository';

const CommandHandlers = [
  CheckoutHandler,
  AddToCartHandler,
  UpdateCartItemHandler,
  RemoveCartItemHandler,
  ClearCartHandler,
  GenerateInvoiceHandler,
  MergeCartHandler,
  OpenOrderDisputeHandler,
  ResolveOrderDisputeHandler,
  MarkOrderPreparingHandler,
  MarkOrderReadyHandler,
  ShipOrderItemHandler,
  UpdateOrderStatusHandler,
  BulkUpdateOrderStatusHandler,
  CancelOrderAdminHandler,
];

const QueryHandlers = [
  GetCartHandler,
  ListAdminOrdersHandler,
  GetAdminOrderHandler,
  GetMyOrdersHandler,
  GetOrderDetailsHandler,
];

const Repositories = [
  { provide: 'ICartRepository', useClass: MongoCartRepository },
  { provide: 'IOrderRepository', useClass: MongoOrderRepository },
  { provide: 'IInvoiceRepository', useClass: MongoInvoiceRepository },
  { provide: 'IDisputeRepository', useClass: MongoDisputeRepository },
  { provide: 'IUserAddressRepository', useClass: MongoUserAddressRepository },
  { provide: 'ICouponRepository', useClass: MongoCouponRepository },
  { provide: 'IEscrowCouponRepository', useClass: MongoEscrowCouponRepository },
];

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: CartItem.name, schema: CartItemSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InvoiceItem.name, schema: InvoiceItemSchema },
      { name: Dispute.name, schema: DisputeSchema },
      { name: EscrowCoupon.name, schema: EscrowCouponSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
    ]),
    FinancialGatewayModule,
    CatalogModule,
    forwardRef(() => VendorModule),
    AuditMongooseModule,
  ],
  controllers: [
    CartController,
    CheckoutController,
    PaymentController,
    OrderAdminController,
    OrderController,
    ReturnController,
    EInvoiceController,
    OrderEInvoiceController,
    AdminEInvoiceController,
  ],
  providers: [
    PricingService,
    CheckoutService,
    StorageService,
    InvoicePdfService,
    OrderExpiryService,
    OrderEscrowWorker,
    ReturnService,
    ReturnSchedulerService,
    EInvoiceGeneratorService,
    OrderDeliveredConsumer,
    EfaturaComAdapter,
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    { provide: 'IReturnRequestRepository', useClass: MongoReturnRequestRepository },
    { provide: 'IEInvoiceProvider', useClass: EfaturaComAdapter },
    MongoOrderRepository,
    MongoVendorRepository,
    MongoCartRepository,
    MongoListingRepository,
  ],
  exports: [
    ...Repositories,
    StorageService,
    ReturnService,
  ],
})
export class CommerceModule {}