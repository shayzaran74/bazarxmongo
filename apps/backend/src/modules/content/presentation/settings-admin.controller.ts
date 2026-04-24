import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Settings Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/settings')
export class SettingsAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Get admin settings' })
  @Get()
  async getSettings() {
    return {
      success: true,
      data: {
        maintenanceMode: false,
        allowRegistration: true,
        defaultCommissionRate: 10
      }
    };
  }
}
