// apps/backend/src/modules/content/presentation/dynamic-admin.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { IAnnouncement, IDynamicContent, IPolicy } from '@barterborsa/shared-persistence';

@ApiTags('Dynamic Content Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/dynamic')
export class DynamicContentAdminController {
  constructor(
    @InjectModel('Announcement')   private readonly announcementModel:  Model<IAnnouncement>,
    @InjectModel('DynamicContent') private readonly dynamicModel:       Model<IDynamicContent>,
    @InjectModel('Policy')         private readonly policyModel:        Model<IPolicy>,
  ) {}

  @ApiOperation({ summary: 'Duyuru listesi (Admin)' })
  @Get('announcements')
  async getAnnouncements() {
    const items = await this.announcementModel.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Dinamik içerik listesi (Admin)' })
  @Get('contents')
  async getContents() {
    const items = await this.dynamicModel.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Politika listesi (Admin)' })
  @Get('policies')
  async getPolicies() {
    const items = await this.policyModel.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: items };
  }
}
