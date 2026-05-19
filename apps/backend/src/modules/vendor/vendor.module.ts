// apps/backend/src/modules/vendor/vendor.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MongoVendorB2BDataRepository } from './infrastructure/persistence/mongo-vendor-b2b-data.repository';
import { MongoUserLevelRepository } from '../barter/infrastructure/persistence/mongo-user-level.repository';
import { MongoListingRepository } from '../catalog/infrastructure/persistence/mongo-listing.repository';
import { MongoCatalogProductRepository } from '../catalog/infrastructure/persistence/mongo-catalog-product.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { CommerceModule } from '../commerce/commerce.module';

// Controllers
import { CompanyController } from './presentation/company.controller';
import { VendorController } from './presentation/vendor.controller';
import { VendorAdminController } from './presentation/vendor-admin.controller';
import { VendorProductController } from './presentation/vendor-product.controller';
import { EcosystemController } from './presentation/ecosystem.controller';
import { VendorBannersController } from './presentation/vendor-banners.controller';
import { VendorBrandsController } from './presentation/vendor-brands.controller';
import { VendorAdsController } from './presentation/vendor-ads.controller';
import { EarlyPaymentController, AdminEarlyPaymentController } from './presentation/early-payment.controller';
import { VendorScoreController } from './presentation/vendor-score.controller';

// Command handlers
import { CreateCompanyHandler } from './application/commands/create-company.handler';
import { RegisterVendorHandler } from './application/commands/register-vendor.handler';
import { UpdateStockHandler } from './application/commands/update-stock.handler';
import { CreateVendorProductHandler } from './application/commands/create-vendor-product.handler';
import { UpdateVendorProductHandler } from './application/commands/update-vendor-product.handler';
import { DeleteVendorProductHandler } from './application/commands/delete-vendor-product.handler';
import { CreateEcosystemHandler } from './application/commands/create-ecosystem.handler';
import { AddEcosystemMemberHandler } from './application/commands/add-ecosystem-member.handler';
import { RemoveEcosystemMemberHandler } from './application/commands/remove-ecosystem-member.handler';
import { UpdateEcosystemSettingsHandler } from './application/commands/update-ecosystem-settings.handler';
import { ApproveVendorHandler } from './application/commands/approve-vendor.handler';
import { RejectVendorHandler } from './application/commands/reject-vendor.handler';
import { UpdateAdminVendorHandler } from './application/commands/update-admin-vendor.handler';
import { AddVendorCategoryHandler } from './application/commands/add-vendor-category.handler';
import { RemoveVendorCategoryHandler } from './application/commands/remove-vendor-category.handler';
import { BulkImportVendorProductsHandler } from './application/commands/bulk-import-vendor-products.handler';
import { ApplyBrandHandler } from './application/commands/apply-brand.handler';
import { UpdateBrandHandler } from './application/commands/update-brand.handler';
import { DeleteBrandHandler } from './application/commands/delete-brand.handler';
import { CreateBannerHandler } from './application/commands/create-banner.handler';
import { UpdateBannerHandler } from './application/commands/update-banner.handler';
import { DeleteBannerHandler } from './application/commands/delete-banner.handler';
import { UpdateRestaurantSettingsHandler } from './application/commands/update-restaurant-settings.handler';
import { UpdateCompanyStatusHandler } from './application/commands/update-company-status.handler';

// Query handlers
import { ListVendorsHandler } from './application/queries/list-vendors.handler';
import { GetCompanyHandler } from './application/queries/get-company.handler';
import { GetVendorBySlugHandler } from './application/queries/get-vendor-by-slug.handler';
import { GetVendorProductsHandler } from './application/queries/get-vendor-products.handler';
import { GetVendorDashboardHandler } from './application/queries/get-vendor-dashboard.handler';
import { GetVendorProfileHandler } from './application/queries/get-vendor-profile.handler';
import { ListVendorProductsHandler } from './application/queries/list-vendor-products.handler';
import { GetMyEcosystemHandler } from './application/queries/get-my-ecosystem.handler';
import { GetEcosystemAuditLogsHandler } from './application/queries/get-ecosystem-audit-logs.handler';
import { GetEcosystemDashboardHandler } from './application/queries/get-ecosystem-dashboard.handler';
import { ListAdminVendorsHandler } from './application/queries/list-admin-vendors.handler';
import { GetMyCompanyHandler } from './application/queries/get-my-company.handler';
import { GetPendingCompaniesHandler } from './application/queries/get-pending-companies.handler';
import { GetVendorOrdersHandler } from './application/queries/get-vendor-orders.handler';
import { GetVendorPendingOrderCountHandler } from './application/queries/get-vendor-pending-order-count.handler';
import { GetVendorTransfersHandler } from './application/queries/get-vendor-transfers.handler';
import { GetVendorInvoicesHandler } from './application/queries/get-vendor-invoices.handler';
import { GetInvoiceDownloadUrlHandler } from './application/queries/get-invoice-download-url.handler';
import { ListVendorBrandsHandler } from './application/queries/list-vendor-brands.handler';
import { ListVendorBannersHandler } from './application/queries/list-vendor-banners.handler';
import { GetVendorAnalyticsHandler } from './application/queries/get-vendor-analytics.handler';
import { GetVendorUsersHandler } from './application/queries/get-vendor-users.handler';

// Repositories — Mongoose (ADR-005 Faz 2a)
import { MongoCompanyRepository } from './infrastructure/persistence/mongo-company.repository';
import { MongoVendorRepository } from './infrastructure/persistence/mongo-vendor.repository';
import { MongoVendorProfileRepository } from './infrastructure/persistence/mongo-vendor-profile.repository';
import { MongoVendorSettingsRepository } from './infrastructure/persistence/mongo-vendor-settings.repository';
import { MongoVendorCategoryRepository } from './infrastructure/persistence/mongo-vendor-category.repository';
import { MongoVendorBannerRepository } from './infrastructure/persistence/mongo-vendor-banner.repository';
import { MongoBrandRepository } from './infrastructure/persistence/mongo-brand.repository';
import { MongoInventoryLogRepository } from './infrastructure/persistence/mongo-inventory-log.repository';
import { MongoListingImageRepository } from './infrastructure/persistence/mongo-listing-image.repository';
import { MongoBrandEcosystemRepository } from './infrastructure/persistence/mongo-brand-ecosystem.repository';
import { MongoEcosystemAuditLogRepository } from './infrastructure/persistence/mongo-ecosystem-audit-log.repository';
import { MongoSwapSessionRepository } from '../barter/infrastructure/persistence/mongo-swap-session.repository';
import { MongoEarlyPaymentRepository } from './infrastructure/persistence/mongo-early-payment.repository';
import { MongoVendorScoreRepository } from './infrastructure/persistence/mongo-vendor-score.repository';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository';
import { MongoTrustScoreRepository } from './infrastructure/persistence/mongo-trust-score.repository';

// Services
import { VendorRegistrationService } from './application/services/vendor-registration.service';
import { FileParserService } from './application/services/file-parser.service';
import { CommissionEngineService } from './application/services/commission-engine.service';
import { CommissionController } from './presentation/commission.controller';
import { EarlyPaymentService } from './application/services/early-payment.service';
import { VendorScoreService } from './application/services/vendor-score.service';

const CommandHandlers = [
  CreateCompanyHandler,
  RegisterVendorHandler,
  UpdateStockHandler,
  CreateVendorProductHandler,
  UpdateVendorProductHandler,
  DeleteVendorProductHandler,
  CreateEcosystemHandler,
  AddEcosystemMemberHandler,
  RemoveEcosystemMemberHandler,
  UpdateEcosystemSettingsHandler,
  ApproveVendorHandler,
  RejectVendorHandler,
  UpdateAdminVendorHandler,
  AddVendorCategoryHandler,
  RemoveVendorCategoryHandler,
  BulkImportVendorProductsHandler,
  ApplyBrandHandler,
  UpdateBrandHandler,
  DeleteBrandHandler,
  CreateBannerHandler,
  UpdateBannerHandler,
  DeleteBannerHandler,
  UpdateRestaurantSettingsHandler,
  UpdateCompanyStatusHandler,
];

const QueryHandlers = [
  ListVendorsHandler,
  GetCompanyHandler,
  GetVendorBySlugHandler,
  GetVendorProductsHandler,
  GetVendorDashboardHandler,
  GetVendorProfileHandler,
  ListVendorProductsHandler,
  GetMyEcosystemHandler,
  GetEcosystemAuditLogsHandler,
  GetEcosystemDashboardHandler,
  ListAdminVendorsHandler,
  GetMyCompanyHandler,
  GetPendingCompaniesHandler,
  GetVendorOrdersHandler,
  GetVendorPendingOrderCountHandler,
  GetVendorTransfersHandler,
  GetVendorInvoicesHandler,
  GetInvoiceDownloadUrlHandler,
  ListVendorBrandsHandler,
  ListVendorBannersHandler,
  GetVendorAnalyticsHandler,
  GetVendorUsersHandler,
];

const Repositories = [
  { provide: 'ICompanyRepository', useClass: MongoCompanyRepository },
  { provide: 'IVendorRepository', useClass: MongoVendorRepository },
  { provide: 'IVendorProfileRepository', useClass: MongoVendorProfileRepository },
  { provide: 'IVendorSettingsRepository', useClass: MongoVendorSettingsRepository },
  { provide: 'IVendorBannerRepository', useClass: MongoVendorBannerRepository },
  { provide: 'IBrandRepository', useClass: MongoBrandRepository },
  { provide: 'IUserRepository', useClass: MongoUserRepository },
  { provide: 'IVendorB2BDataRepository', useClass: MongoVendorB2BDataRepository },
  { provide: 'IUserLevelRepository', useClass: MongoUserLevelRepository },
  { provide: 'ISwapSessionRepository', useClass: MongoSwapSessionRepository },
];

// Vendor schemas — ADR-005 Faz 2c
import { Vendor, VendorSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/vendor.schema';
import { Company, CompanySchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/company.schema';
import { VendorProfile, VendorProfileSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/vendorProfile.schema';
import { VendorSettings, VendorSettingsSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/vendorSettings.schema';
import { VendorB2BData, VendorB2BDataSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/vendorB2BData.schema';
import { VendorCategory, VendorCategorySchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/vendorCategory.schema';
import { VendorBanner, VendorBannerSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/vendorBanner.schema';
import { Brand, BrandSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/brand.schema';
import { InventoryLog, InventoryLogSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/inventoryLog.schema';
import { ListingImage, ListingImageSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/listingImage.schema';
import { BrandEcosystem, BrandEcosystemSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/brandEcosystem.schema';
import { EcosystemAuditLog, EcosystemAuditLogSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/ecosystemAuditLog.schema';
import { VendorViolationModel, VendorViolationSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/vendorViolation.schema';
import { EarlyPaymentRequest, EarlyPaymentRequestSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/early-payment-request.schema';
import { User, UserSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/user.schema';
import { UserProfile, UserProfileSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/userProfile.schema';
import { Category, CategorySchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/category.schema';
import { Listing, ListingSchema } from '../../../../../packages/shared/shared-persistence/src/schemas/backend/listing.schema';

import { CatalogModule } from '../catalog/catalog.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => CommerceModule),
    CatalogModule,
    InventoryModule,
    MongooseModule.forFeature([
      { name: 'Vendor', schema: VendorSchema },
      { name: 'Company', schema: CompanySchema },
      { name: 'VendorProfile', schema: VendorProfileSchema },
      { name: 'VendorSettings', schema: VendorSettingsSchema },
      { name: 'VendorB2BData', schema: VendorB2BDataSchema },
      { name: 'VendorCategory', schema: VendorCategorySchema },
      { name: 'VendorBanner', schema: VendorBannerSchema },
      { name: 'Brand', schema: BrandSchema },
      { name: 'InventoryLog', schema: InventoryLogSchema },
      { name: 'ListingImage', schema: ListingImageSchema },
      { name: 'BrandEcosystem', schema: BrandEcosystemSchema },
      { name: 'EcosystemAuditLog', schema: EcosystemAuditLogSchema },
      { name: 'VendorViolation', schema: VendorViolationSchema },
      { name: 'EarlyPaymentRequest', schema: EarlyPaymentRequestSchema },
      { name: 'User', schema: UserSchema },
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'Category', schema: CategorySchema },
      { name: 'Listing', schema: ListingSchema },
    ]),
  ],
  controllers: [
    CompanyController,
    VendorController,
    VendorProductController,
    VendorAdminController,
    EcosystemController,
    VendorBannersController,
    VendorBrandsController,
    VendorAdsController,
    CommissionController,
    EarlyPaymentController,
    AdminEarlyPaymentController,
    VendorScoreController,
  ],
  providers: [
    VendorRegistrationService,
    FileParserService,
    CommissionEngineService,
    EarlyPaymentService,
    VendorScoreService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    MongoVendorCategoryRepository,
    MongoListingRepository,
    MongoCatalogProductRepository,
    MongoCompanyRepository,
    MongoUserRepository,
    MongoVendorProfileRepository,
    MongoVendorBannerRepository,
    MongoBrandRepository,
    MongoInventoryLogRepository,
    MongoListingImageRepository,
    MongoBrandEcosystemRepository,
    MongoEcosystemAuditLogRepository,
    { provide: 'IEarlyPaymentRepository', useClass: MongoEarlyPaymentRepository },
    { provide: 'IVendorScoreRepository', useClass: MongoVendorScoreRepository },
    { provide: 'ITrustScoreRepository', useClass: MongoTrustScoreRepository },
  ],
  exports: [CommissionEngineService, EarlyPaymentService, 'IVendorRepository', 'ITrustScoreRepository'],
})
export class VendorModule {}
