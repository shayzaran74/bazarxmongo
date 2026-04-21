// apps/backend/src/modules/vendor/vendor.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CompanyController } from './presentation/company.controller';
import { VendorController } from './presentation/vendor.controller';
import { VendorAdminController } from './presentation/vendor-admin.controller';
import { VendorProductController } from './presentation/vendor-product.controller';
import { EcosystemController } from './presentation/ecosystem.controller';
import { AnalyticsController } from './presentation/analytics.controller';
import { VendorBannersController } from './presentation/vendor-banners.controller';
import { VendorBrandsController } from './presentation/vendor-brands.controller';
import { AdsController, VendorAdsController } from './presentation/ads.controller';
import { CreateCompanyHandler } from './application/commands/create-company.handler';
import { RegisterVendorHandler } from './application/commands/register-vendor.handler';
import { UpdateStockHandler } from './application/commands/update-stock.handler';
import { ListVendorsHandler } from './application/queries/list-vendors.handler';
import { GetCompanyHandler } from './application/queries/get-company.handler';
import { GetVendorBySlugHandler } from './application/queries/get-vendor-by-slug.handler';
import { GetVendorProductsHandler } from './application/queries/get-vendor-products.handler';
import { GetVendorDashboardHandler } from './application/queries/get-vendor-dashboard.handler';
import { GetVendorProfileHandler } from './application/queries/get-vendor-profile.handler';
import { CreateVendorProductHandler } from './application/commands/create-vendor-product.handler';
import { UpdateVendorProductHandler } from './application/commands/update-vendor-product.handler';
import { DeleteVendorProductHandler } from './application/commands/delete-vendor-product.handler';
import { ListVendorProductsHandler } from './application/queries/list-vendor-products.handler';
import { GetMyEcosystemHandler } from './application/queries/get-my-ecosystem.handler';
import { GetEcosystemAuditLogsHandler } from './application/queries/get-ecosystem-audit-logs.handler';
import { CreateEcosystemHandler } from './application/commands/create-ecosystem.handler';
import { AddEcosystemMemberHandler } from './application/commands/add-ecosystem-member.handler';
import { ApproveVendorHandler } from './application/commands/approve-vendor.handler';
import { RejectVendorHandler } from './application/commands/reject-vendor.handler';
import { UpdateAdminVendorHandler } from './application/commands/update-admin-vendor.handler';
import { AddVendorCategoryHandler } from './application/commands/add-vendor-category.handler';
import { RemoveVendorCategoryHandler } from './application/commands/remove-vendor-category.handler';
import { ListAdminVendorsHandler } from './application/queries/list-admin-vendors.handler';
import { GetMyCompanyHandler } from './application/queries/get-my-company.handler';
import { GetPendingCompaniesHandler } from './application/queries/get-pending-companies.handler';
import { PrismaCompanyRepository } from './infrastructure/persistence/prisma-company.repository';
import { PrismaVendorRepository } from './infrastructure/persistence/prisma-vendor.repository';
import { PrismaVendorProfileRepository } from './infrastructure/persistence/prisma-vendor-profile.repository';
import { PrismaVendorSettingsRepository } from './infrastructure/persistence/prisma-vendor-settings.repository';
import { VendorRegistrationService } from './application/services/vendor-registration.service';

const CommandHandlers = [
  CreateCompanyHandler, 
  RegisterVendorHandler, 
  UpdateStockHandler,
  CreateVendorProductHandler,
  UpdateVendorProductHandler,
  DeleteVendorProductHandler,
  CreateEcosystemHandler,
  AddEcosystemMemberHandler,
  ApproveVendorHandler,
  RejectVendorHandler,
  UpdateAdminVendorHandler,
  AddVendorCategoryHandler,
  RemoveVendorCategoryHandler,
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
];
const Repositories = [
  { provide: 'ICompanyRepository', useClass: PrismaCompanyRepository },
  { provide: 'IVendorRepository', useClass: PrismaVendorRepository },
  { provide: 'IVendorProfileRepository', useClass: PrismaVendorProfileRepository },
  { provide: 'IVendorSettingsRepository', useClass: PrismaVendorSettingsRepository },
];

@Module({
  imports: [CqrsModule],
  controllers: [
    CompanyController, 
    VendorController, 
    VendorProductController,
    VendorAdminController,
    EcosystemController,
    AnalyticsController,
    VendorBannersController,
    VendorBrandsController,
    AdsController,
    VendorAdsController
  ],
  providers: [
    VendorRegistrationService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    // Add repositories explicitly for DI if not using string tokens everywhere
    PrismaCompanyRepository,
    PrismaVendorRepository,
    PrismaVendorProfileRepository,
    PrismaVendorSettingsRepository,
  ],
})
export class VendorModule {}
