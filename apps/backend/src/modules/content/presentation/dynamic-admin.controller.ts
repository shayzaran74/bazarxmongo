// apps/backend/src/modules/content/presentation/dynamic-admin.controller.ts
// @Controller prefix: /dynamic/admin → /admin/dynamic (tutarlılık)

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Dynamic Content Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/dynamic')
export class DynamicContentAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Duyuru listesi (Admin)' })
  @Get('announcements')
  async getAnnouncements() {
    const items = await this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Dinamik içerik listesi (Admin)' })
  @Get('contents')
  async getContents() {
    const items = await this.prisma.dynamicContent.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Politika listesi (Admin)' })
  @Get('policies')
  async getPolicies() {
    const items = await this.prisma.policy.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  }
}
