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
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('q') search?: string
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    console.log('🔍 Fetching vendors for admin...', { pageNum, limitNum, search });

    try {
      const where = search 
        ? { company: { name: { contains: search, mode: 'insensitive' as any } } } 
        : {};

      const [items, total] = await Promise.all([
        this.prisma.vendor.findMany({
          where,
          include: { 
            company: { 
              select: { name: true, email: true } 
            } 
          },
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.vendor.count({ where })
      ]);

      return {
        success: true,
        data: {
          items,
          total,
          page: pageNum,
          limit: limitNum
        }
      };
    } catch (error) {
      console.error('❌ Error fetching vendors:', error);
      throw error; // Let NestJS filter handle it but we see it in logs
    }
  }
}
