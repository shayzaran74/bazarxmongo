import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Brand Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/brands')
export class BrandAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all brands for admin' })
  @Get()
  async getBrands(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('q') search?: string
  ) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.prisma.brand.findMany({
        where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' }
      }),
      this.prisma.brand.count({
        where: search ? { name: { contains: search, mode: 'insensitive' } } : {}
      })
    ]);

    return {
      success: true,
      data: {
        items,
        total,
        page,
        limit
      }
    };
  }
}
