// apps/backend/src/modules/vendor/vendor.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { CommerceModule } from '../commerce/commerce.module';

// Controllers
import { CompanyController } from './presentation/company.controller';
import { VendorController } from './presentation/vendor.controller';
import { VendorAdminController } from './presentation/vendor-admin.controller';
import { VendorProductController } from './presentation/vendor-product.controller';
import { EcosystemController } from './presentation/ecosystem.controller';
import { VendorBannersController } from './presentation/vendor-banners.controller';
import { VendorBrandsController } from './presentation/vendor-brands.controller';
import { AdsController } from './presentation/ads.controller';
import { VendorAdsController } from './presentation/vendor-ads.controller';

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

// Repositories — sadece token olarak kayıtlı, sınıf tekrarı yok
import { PrismaCompanyRepository } from './infrastructure/persistence/prisma-company.repository';
import { PrismaVendorRepository } from './infrastructure/persistence/prisma-vendor.repository';
import { PrismaVendorProfileRepository } from './infrastructure/persistence/prisma-vendor-profile.repository';
import { PrismaVendorSettingsRepository } from './infrastructure/persistence/prisma-vendor-settings.repository';

// Services
import { VendorRegistrationService } from './application/services/vendor-registration.service';
import { FileParserService } from './application/services/file-parser.service';
import { CommissionEngineService } from './application/services/commission-engine.service';
import { CommissionController } from './presentation/commission.controller';

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
  { provide: 'ICompanyRepository', useClass: PrismaCompanyRepository },
  { provide: 'IVendorRepository', useClass: PrismaVendorRepository },
  { provide: 'IVendorProfileRepository', useClass: PrismaVendorProfileRepository },
  { provide: 'IVendorSettingsRepository', useClass: PrismaVendorSettingsRepository },
];

@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    CommerceModule,
  ],
  controllers: [
    CompanyController,
    VendorController,
    VendorProductController,
    VendorAdminController,
    EcosystemController,
    VendorBannersController,
    VendorBrandsController,
    AdsController,
    VendorAdsController,
    CommissionController,
  ],
  providers: [
    VendorRegistrationService,
    FileParserService,
    CommissionEngineService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
  ],
  exports: [CommissionEngineService],
})
export class VendorModule {}
