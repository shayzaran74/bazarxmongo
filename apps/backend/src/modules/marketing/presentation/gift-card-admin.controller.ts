import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Gift Card Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/gift-cards')
export class GiftCardAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List gift cards' })
  @Get()
  async listGiftCards() {
    return { success: true, data: [] };
  }
}
