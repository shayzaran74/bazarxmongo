"use strict";
// apps/backend/src/app.module.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const identity_module_1 = require("./modules/identity/identity.module");
const shared_security_1 = require("@barterborsa/shared-security");
const catalog_module_1 = require("./modules/catalog/catalog.module");
const marketing_module_1 = require("./modules/marketing/marketing.module");
const financial_gateway_module_1 = require("./modules/financial-gateway/financial-gateway.module");
const vendor_module_1 = require("./modules/vendor/vendor.module");
const commerce_module_1 = require("./modules/commerce/commerce.module");
const barter_module_1 = require("./modules/barter/barter.module");
const auction_module_1 = require("./modules/auction/auction.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '../../.env',
            }),
            shared_security_1.SharedSecurityModule, // Global güvenlik altyapısı
            identity_module_1.IdentityModule,
            catalog_module_1.CatalogModule,
            marketing_module_1.MarketingModule,
            financial_gateway_module_1.FinancialGatewayModule,
            vendor_module_1.VendorModule,
            commerce_module_1.CommerceModule,
            barter_module_1.BarterModule,
            auction_module_1.AuctionModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: shared_security_1.JwtAuthGuard, // Tüm uygulamayı varsayılan olarak kilitle
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map