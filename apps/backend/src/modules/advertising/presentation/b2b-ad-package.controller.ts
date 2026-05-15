// apps/backend/src/modules/advertising/presentation/b2b-ad-package.controller.ts
// Master Plan v4.3 §3.2 — B2B Reklam Paketleri (Prime 1-4) REST endpoint'leri

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { B2BAdPackageService } from '../application/services/b2b-ad-package.service';
import { B2BAdPackageType, B2BAdPackagePeriod } from '../domain/enums/b2b-ad-package.enum';

interface AuthenticatedUser {
  id:        string;
  vendorId?: string;
  role:      string;
}

interface PurchasePackageBody {
  type:       B2BAdPackageType;
  period:     B2BAdPackagePeriod;
  imageUrl?:  string;
  linkUrl?:   string;
  startDate?: string;
}

@ApiTags('B2B Ad Packages')
@Controller('b2b/ad-packages')
export class B2BAdPackageController {
  constructor(private readonly packageService: B2BAdPackageService) {}

  // Master Plan v4.3 §3.2 — Tüm paketleri listele (public, vendor dashboard'da gösterilir)
  @ApiOperation({ summary: 'Prime 1-4 reklam paketlerini listele' })
  @Get()
  listPackages() {
    return { packages: this.packageService.listPackages() };
  }

  @ApiOperation({ summary: 'Tek paket detay' })
  @Get(':type')
  getPackage(@Param('type') type: B2BAdPackageType) {
    return this.packageService.getPackage(type);
  }

  // Vendor satın alma
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR')
  @ApiOperation({ summary: 'Paket satın al — AdCampaign oluşturulur' })
  @Post('purchase')
  async purchase(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: PurchasePackageBody,
  ) {
    if (!user.vendorId) {
      throw new Error('Bu kullanıcının vendor bağlantısı yok.');
    }
    return this.packageService.purchasePackage({
      vendorId:  user.vendorId,
      type:      body.type,
      period:    body.period,
      imageUrl:  body.imageUrl,
      linkUrl:   body.linkUrl,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
    });
  }
}
