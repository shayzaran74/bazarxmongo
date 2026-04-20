import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Badge Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/badge-rules')
export class BadgeAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List badge rules' })
  @Get()
  async listBadgeRules() {
    return { success: true, data: [] };
  }
}
