import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Catalog')
@Controller('brands')
export class BrandController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @ApiOperation({ summary: 'List brands', description: 'Markaları listeler.' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
  @ApiResponse({ status: 200, description: 'Marka listesi.' })
  @Get()
  async getBrands(@Query('limit') limit: string = '12') {
    const take = parseInt(limit) || 12;
    const brands = await this.prisma.brand.findMany({
      take,
      where: { status: 'APPROVED' },
      orderBy: { name: 'asc' }
    });
    
    return {
      success: true,
      data: brands
    };
  }
}
