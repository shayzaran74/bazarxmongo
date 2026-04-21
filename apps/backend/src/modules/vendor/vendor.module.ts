// apps/backend/src/modules/vendor/vendor.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CompanyController } from './presentation/company.controller';
import { VendorController } from './presentation/vendor.controller';
import { VendorAdminController } from './presentation/vendor-admin.controller';
import { VendorProductController } from './presentation/vendor-product.controller';
import { EcosystemController, AnalyticsController, VendorBannersController, VendorBrandsController, AdsController, VendorAdsController } from './presentation/other.controller';
import { CreateCompanyHandler } from './application/commands/create-company.handler';
import { RegisterVendorHandler } from './application/commands/register-vendor.handler';
import { UpdateStockHandler } from './application/commands/update-stock.handler';
import { ListVendorsHandler } from './application/queries/list-vendors.handler';
import { GetCompanyHandler } from './application/queries/get-company.handler';
import { GetVendorBySlugHandler } from './application/queries/get-vendor-by-slug.handler';
import { GetVendorProductsHandler } from './application/queries/get-vendor-products.handler';
import { GetVendorDashboardHandler } from './application/queries/get-vendor-dashboard.handler';
import { GetVendorProfileHandler } from './application/queries/get-vendor-profile.handler';
import { PrismaCompanyRepository } from './infrastructure/persistence/prisma-company.repository';
import { PrismaVendorRepository } from './infrastructure/persistence/prisma-vendor.repository';
import { PrismaVendorProfileRepository } from './infrastructure/persistence/prisma-vendor-profile.repository';
import { PrismaVendorSettingsRepository } from './infrastructure/persistence/prisma-vendor-settings.repository';
import { VendorRegistrationService } from './application/services/vendor-registration.service';

const CommandHandlers = [CreateCompanyHandler, RegisterVendorHandler, UpdateStockHandler];
const QueryHandlers = [
  ListVendorsHandler, 
  GetCompanyHandler, 
  GetVendorBySlugHandler, 
  GetVendorProductsHandler,
  GetVendorDashboardHandler,
  GetVendorProfileHandler
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
