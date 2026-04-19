import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Product Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/products')
export class ProductAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all products for admin' })
  @Get()
  async getProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('q') search?: string
  ) {
    const skip = (page - 1) * limit;
    
    // Basit bir listeleme mantığı. İhtiyaca göre CatalogProduct veya Product üzerinden genişletilebilir.
    const [items, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
        include: { category: true, Brand: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.catalogProduct.count({
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

  @ApiOperation({ summary: 'Get product types' })
  @Get('../product-types') // Bu, controller dekoratörüne rağmen /admin/product-types olarak maplenir veya ayrı controller'a taşınabilir.
  // Ancak NestJS'de bu şekilde kullanımı riskli olabilir. Ayrı controller daha sağlıklı.
  async getProductTypes() {
    return {
      success: true,
      data: [
        { id: 'PHYSICAL', name: 'Fiziksel Ürün' },
        { id: 'DIGITAL', name: 'Dijital Ürün' },
        { id: 'SERVICE', name: 'Hizmet' }
      ]
    };
  }
}
