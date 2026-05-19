// apps/backend/src/modules/loyalty/presentation/admin-tier.controller.ts

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { IMembershipTier } from '@barterborsa/shared-persistence';

@ApiTags('Admin Tier Management')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/tiers')
export class AdminTierController {
  constructor(
    @InjectModel('MembershipTier') private readonly tierModel: Model<IMembershipTier>,
  ) {}

  @ApiOperation({ summary: 'List all membership tiers' })
  @Get()
  async listTiers() {
    const items = await this.tierModel.find().sort({ minXp: 1 }).lean();

    const data = items.map(item => ({
      id:           item.id,
      tier:         item.tier,
      minXp:        item.minXp,
      description:  item.description,
      xpMultiplier: parseFloat((item.rewardMultiplier ?? Types.Decimal128.fromString('1')).toString()),
      ...((item.benefitMetadata as Record<string, unknown>) ?? {}),
    }));

    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create or update tier rule' })
  @Post()
  async upsertTier(@Body() body: Record<string, unknown>) {
    const { id, tier, minXp, description, xpMultiplier, ...metadata } = body;

    const data = {
      tier:             tier as string,
      minXp:            parseInt(String(minXp ?? 0)) || 0,
      description:      (description as string) || '',
      rewardMultiplier: Types.Decimal128.fromString(String(parseFloat(String(xpMultiplier ?? 1)) || 1.0)),
      benefitMetadata:  metadata,
    };

    if (id && String(id) !== '') {
      await this.tierModel.updateOne({ id: String(id) }, { $set: data });
    } else {
      await this.tierModel.findOneAndUpdate(
        { tier: data.tier },
        { $set: data, $setOnInsert: { _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString() } },
        { upsert: true, setDefaultsOnInsert: true },
      );
    }

    return { success: true };
  }
}
