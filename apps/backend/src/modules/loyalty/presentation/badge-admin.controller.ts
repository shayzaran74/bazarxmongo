// apps/backend/src/modules/loyalty/presentation/badge-admin.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';

@ApiTags('Badge Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/badge-rules')
export class BadgeAdminController {
  @ApiOperation({ summary: 'List badge rules' })
  @Get()
  listBadgeRules() {
    return { success: true, data: [] };
  }
}
