import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Side Ads')
@Controller('side-ads')
export class SideAdsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @ApiOperation({ summary: 'Get active side ads' })
  @Get()
  async getSideAds(
    @Query('side') side?: string,
    @Query('ecosystem') ecosystem?: string,
    @Query('city') city?: string,
  ) {
    const where: any = { isActive: true };
    if (side) where.side = side;
    if (ecosystem && ecosystem !== 'GLOBAL') {
      where.ecosystems = { hasSome: [ecosystem, 'GLOBAL'] };
    }

    const items = await this.prisma.sideAd.findMany({
      where,
      include: { locations: true },
      orderBy: { order: 'asc' },
    });

    return { success: true, data: items };
  }
}
