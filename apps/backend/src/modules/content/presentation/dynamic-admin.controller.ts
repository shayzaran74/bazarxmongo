import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Dynamic Content Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dynamic/admin')
export class DynamicContentAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('announcements')
  async getAnnouncements() {
    const items = await this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    return { success: true, data: items };
  }

  @Get('contents')
  async getContents() {
    const items = await this.prisma.dynamicContent.findMany({ orderBy: { createdAt: 'desc' } });
    return { success: true, data: items };
  }

  @Get('policies')
  async getPolicies() {
    const items = await this.prisma.policy.findMany({ orderBy: { createdAt: 'desc' } });
    return { success: true, data: items };
  }
}
