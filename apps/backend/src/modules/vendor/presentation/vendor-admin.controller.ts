import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Vendor Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/vendors')
export class VendorAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all vendors for admin' })
  @Get()
  async getVendors(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('q') search?: string
  ) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where: search ? { companyName: { contains: search, mode: 'insensitive' } } : {},
        include: { user: { select: { email: true } } },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.vendor.count({
        where: search ? { companyName: { contains: search, mode: 'insensitive' } } : {}
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
