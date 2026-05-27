// apps/backend/src/modules/loyalty/presentation/tier.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { IVendor } from '@barterborsa/shared-persistence';

interface AuthenticatedUser { id: string; role: string }

@ApiTags('Tiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tiers')
export class TierController {
  constructor(
    @InjectModel('Vendor') private readonly vendorModel: Model<IVendor>,
  ) {}

  @ApiOperation({ summary: 'Get current user tier' })
  @Get('me')
  async getMyTier(@CurrentUser() user: AuthenticatedUser) {
    try {
      const vendor = await this.vendorModel
        .findOne({ userId: user.id }, { id: 1, tier: 1 })
        .lean();

      return {
        success: true,
        data:    { tier: vendor?.tier || 'STANDARD', vendorId: vendor?.id || null },
      };
    } catch {
      return { success: true, data: { tier: 'STANDARD', vendorId: null } };
    }
  }
}
