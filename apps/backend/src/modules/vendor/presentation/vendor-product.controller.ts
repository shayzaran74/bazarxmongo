import { 
  Controller, 
  Post, 
  Put, 
  Patch,
  Delete, 
  Get,
  Query,
  Body, 
  Param, 
  UseGuards, 
  BadRequestException,
  NotFoundException,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';

@ApiTags('Vendors-Products')
@Controller('vendors/products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN')
export class VendorProductController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('bulk/import')
  @ApiOperation({ summary: 'Bulk import products via Excel/CSV' })
  @UseInterceptors(FileInterceptor('file'))
  async bulkImport(@CurrentUser() user: any, @UploadedFile() file: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) throw new BadRequestException('Vendor not found');

    if (!file) {
      throw new BadRequestException('Lütfen bir dosya yükleyin.');
    }

    try {
      // TODO: Actual Excel parsing logic (e.g., using xlsx library)
      console.log('--- VendorProduct.bulkImport: Received file ---', file.originalname);
      
      return { 
        success: true, 
        message: 'Dosya başarıyla alındı ve işleme sırasına eklendi.',
        data: {
          imported: 0,
          updated: 0,
          failed: 0,
          errors: []
        }
      };
    } catch (e: any) {
      console.error('VendorProduct bulkImport error:', e);
      throw new BadRequestException('Dosya işlenirken hata oluştu: ' + e.message);
    }
  }
  
  @Get()
  @ApiOperation({ summary: 'List my products' })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('q') search?: string
  ) {
    try {
      console.log('--- VendorProduct.findAll BEGIN ---', { userId: user?.id, limit });
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId: user.id }
      });

      if (!vendor) {
        console.warn('⚠️ VendorProduct.findAll: Vendor NOT FOUND');
        throw new BadRequestException('Vendor not found');
      }

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 50;
      const skip = (pageNum - 1) * limitNum;

      const where: any = { vendorId: vendor.id };
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      console.log('--- VendorProduct.findAll: Querying Prisma ---', { vendorId: vendor.id, skip, take: limitNum });
      const [items, total] = await Promise.all([
        this.prisma.listing.findMany({
          where,
          include: { 
            images: { take: 1 },
            catalogProduct: { select: { id: true, name: true, gtin: true, brand: true } }
          },
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.listing.count({ where })
      ]);

      console.log('--- VendorProduct.findAll: Success ---', { count: items.length, total });
      return {
        success: true,
        data: {
          items,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      };
    } catch (e: any) {
      console.error('❌ VendorProduct.findAll ERROR:', e);
      throw e;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create new product' })
  async create(@CurrentUser() user: any, @Body() body: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) throw new BadRequestException('Vendor not found');

    // Ensure we have a CatalogProduct
    let catalogProductId = body.catalogProductId;

    if (!catalogProductId) {
      // Create a base catalog product if none provided (Vendor's private addition)
      const catalogProduct = await this.prisma.catalogProduct.create({
        data: {
          name: body.name,
          slug: body.name.toString().toLowerCase().trim().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(7),
          description: body.description || '',
          brand: body.brand || 'Bilinmeyen',
          gtin: body.barcode || null,
          status: 'PENDING'
        }
      });
      catalogProductId = catalogProduct.id;
    }

    try {
      const product = await this.prisma.listing.create({
        data: {
          vendorId: vendor.id,
          catalogProductId,
          title: body.name,
          description: body.description || '',
          price: !isNaN(Number(body.price)) ? Number(body.price) : 0,
          stock: !isNaN(Number(body.stock)) ? Number(body.stock) : 0,
          status: body.isActive ? 'ACTIVE' : 'INACTIVE',
          images: {
            create: (body.productImages || []).map((url: string, index: number) => ({
              url,
              isMain: index === 0,
              order: index
            }))
          }
        }
      });

      return { success: true, data: product };
    } catch (e: any) {
      console.error('VendorProduct create error:', e);
      throw new BadRequestException('Ürün oluşturulurken hata oluştu: ' + e.message);
    }
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  async updateStock(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) throw new BadRequestException('Vendor not found');

    const existing = await this.prisma.listing.findUnique({
      where: { id }
    });

    if (!existing || existing.vendorId !== vendor.id) {
      throw new NotFoundException('Product not found or access denied');
    }

    try {
      const change = Number(body.change) || 0;
      const newStock = Math.max(0, existing.stock + change);
      
      const updated = await this.prisma.listing.update({
        where: { id },
        data: { stock: newStock }
      });

      // Optionally, you could log the reason to a product history table if it existed.
      return { success: true, data: updated };
    } catch (e: any) {
      console.error('VendorProduct updateStock error:', e);
      throw new BadRequestException('Stok güncellenirken hata oluştu: ' + e.message);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) throw new BadRequestException('Vendor not found');

    const existing = await this.prisma.listing.findUnique({
      where: { id }
    });

    if (!existing || existing.vendorId !== vendor.id) {
      throw new NotFoundException('Product not found or access denied');
    }

    try {
      // Update images (naive: clear and recreate)
      if (body.productImages && Array.isArray(body.productImages)) {
        await this.prisma.listingImage.deleteMany({
          where: { listingId: id }
        });
      }

      const updated = await this.prisma.listing.update({
        where: { id },
        data: {
          title: body.name || existing.title,
          description: body.description,
          price: !isNaN(Number(body.price)) ? Number(body.price) : existing.price,
          stock: !isNaN(Number(body.stock)) ? Number(body.stock) : existing.stock,
          status: body.isActive !== undefined ? (body.isActive ? 'ACTIVE' : 'INACTIVE') : existing.status,
          images: (body.productImages && Array.isArray(body.productImages)) ? {
            create: body.productImages.map((url: string, index: number) => ({
              url,
              isMain: index === 0,
              order: index
            }))
          } : undefined
        }
      });

      return { success: true, data: updated };
    } catch (e: any) {
      console.error('VendorProduct update error:', e);
      throw new BadRequestException('Ürün güncellenirken hata oluştu: ' + e.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) throw new BadRequestException('Vendor not found');

    const existing = await this.prisma.listing.findUnique({
      where: { id }
    });

    if (!existing || existing.vendorId !== vendor.id) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.listing.delete({
      where: { id }
    });

    return { success: true };
  }
}
