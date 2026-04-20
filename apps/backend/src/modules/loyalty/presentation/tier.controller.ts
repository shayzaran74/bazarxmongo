import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Tiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tiers')
export class TierController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Get current user tier' })
  @Get('me')
  async getMyTier(@CurrentUser() user: any) {
    // Vendor tier bilgisini döndür
    try {
      const vendor = await this.prisma.vendor.findFirst({
        where: { userId: user.id },
        select: { id: true, tier: true }
      });

      return {
        success: true,
        data: {
          tier: vendor?.tier || 'STANDARD',
          vendorId: vendor?.id || null
        }
      };
    } catch {
      return {
        success: true,
        data: {
          tier: 'STANDARD',
          vendorId: null
        }
      };
    }
  }
}
