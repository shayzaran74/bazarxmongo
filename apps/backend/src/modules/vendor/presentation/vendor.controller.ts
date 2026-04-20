import { Controller, Post, Body, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { RegisterVendorCommand } from '../application/commands/register-vendor.command';
import { RegisterVendorDto } from '../application/dtos/register-vendor.dto';
import { ListVendorsQuery } from '../application/queries/list-vendors.query';
import { GetVendorBySlugQuery } from '../application/queries/get-vendor-by-slug.query';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';

import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor orders', description: 'Satıcının kendi siparişlerini listeler.' })
  @Get('orders')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getVendorOrders(@CurrentUser() user: any, @Query() query: any) {
    // TODO: vendor scope'unda order query implementasyon
    return { success: true, data: [], total: 0 }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor pending orders count', description: 'Satıcının bekleyen sipariş sayısını döner.' })
  @Get('orders/pending-count')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPendingOrderCount(@CurrentUser() user: any) {
    // Mock implementation for now to satisfy frontend
    return { success: true, data: 0 };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor dashboard stats', description: 'Satıcı paneli için istatistikleri döner.' })
  @Get('me/dashboard')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDashboard(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) return { success: false, message: 'Vendor not found' };

    // Get basic stats from prisma
    const [productCount, totalSales] = await Promise.all([
      this.prisma.listing.count({ where: { vendorId: vendor.id } }),
      0 // Mock total sales for now
    ]);

    return {
      success: true,
      data: {
        totalSales: 0,
        orderCount: 0,
        productCount,
        recentActivity: [],
        stats: {
          views: 0,
          conversions: 0
        }
      }
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for vendor status', description: 'Kullanıcıyı sistemde satıcı (vendor) olarak kaydeder.' })
  @ApiBody({ type: RegisterVendorDto })
  @ApiResponse({ status: 201, description: 'Satıcı başvurusu başarıyla oluşturuldu.' })
  @Post('apply')
  async apply(@CurrentUser() user: any, @Body() dto: RegisterVendorDto) {
    return this.commandBus.execute(new RegisterVendorCommand(user.id, dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete vendor application', description: 'Şirket ve satıcı kaydını tek adımda yapar.' })
  @UseGuards(JwtAuthGuard)
  @Post('apply-atomic')
  async register(@CurrentUser() user: any, @Body() body: any) {
    const { 
      businessName, businessType, taxId, phone, email, address, 
      city, district, zipCode, bankName, bankAccountName, bankIban,
      categories 
    } = body;

    try {
      // 0. Ön kontroller
      if (!user?.id) {
        return { success: false, error: 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.' };
      }

      const existingVendor = await this.prisma.vendor.findUnique({
        where: { userId: user.id }
      });

      if (existingVendor) {
        return { success: false, error: 'Bu kullanıcı için zaten bir satıcı kaydı (başvurusu) bulunmaktadır.' };
      }

      return await this.prisma.$transaction(async (tx) => {
        // 1. Şirket oluştur
        const company = await tx.company.create({
          data: {
            name: businessName,
            taxNumber: taxId || null, 
            phone,
            email,
            address,
            companyType: businessType,
            status: 'PENDING'
          }
        });

        // 2. Slug üret
        const slug = this.slugify(businessName) + '-' + Math.random().toString(36).substring(7);

        // 3. Vendor oluştur
        const vendor = await tx.vendor.create({
          data: {
            userId: user.id,
            companyId: company.id,
            slug,
            status: 'PENDING',
            tier: 'CORE'
          }
        });

        // 4. Profil oluştur
        await tx.vendorProfile.create({
          data: {
            vendorId: vendor.id,
            storeName: businessName,
            city: city, 
            district: district
          }
        });

        // 5. Ayarlar oluştur
        await tx.vendorSettings.create({
          data: {
            vendorId: vendor.id
          }
        });

        // 6. Banka hesabı ekle
        if (bankIban) {
          await tx.vendorBankAccount.create({
            data: {
              vendorId: vendor.id,
              bankName: bankName || 'Bilinmeyen Banka',
              accountHolderName: bankAccountName || businessName,
              iban: bankIban
            }
          });
        }

        // 7. Kategorileri bağla
        if (categories && Array.isArray(categories)) {
          for (const catId of categories) {
            await tx.vendorCategory.create({
              data: {
                vendorId: vendor.id,
                categoryId: catId
              }
            });
          }
        }

        // 8. Kullanıcı rolünü güncelle
        await tx.user.update({
          where: { id: user.id },
          data: { role: 'VENDOR' }
        });

        return { success: true, data: vendor };
      });
    } catch (error: any) {
      console.error('Vendor Atomic Application Error:', error);
      
      // Özel hata mesajları
      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        if (target.includes('tax_number')) {
          return { success: false, error: 'Bu vergi numarası zaten başka bir şirket tarafından kullanılmaktadır.' };
        }
        if (target.includes('slug')) {
          return { success: false, error: 'Bu mağaza adı (slug) zaten kullanılmaktadır. Lütfen farklı bir ad deneyin.' };
        }
      }

      return { success: false, error: 'Kayıt işlemi sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') };
    }
  }

  private slugify(text: string): string {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor transfers' })
  @Get('transfers')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTransfers(@CurrentUser() user: any) {
    return { success: true, data: [] };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor invoices' })
  @Get('invoices')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getInvoices(@CurrentUser() user: any) {
    return { success: true, data: [] };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor profile by user ID' })
  @Get('profile/:userId')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('userId') userId: string) {
    const profile = await this.prisma.vendorProfile.findFirst({
      where: { vendor: { userId } }
    });
    return { success: true, data: profile };
  }

  @Public()
  @ApiOperation({ summary: 'List vendors', description: 'Sistemdeki satıcıları listeler. Sayfalama ve filtreleme destekler.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Satıcı listesi.' })
  @Get()
  async list(@Query() query: any) {
    const data = await this.queryBus.execute(new ListVendorsQuery(query));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor products list' })
  @Get('products')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getProducts(@CurrentUser() user: any, @Query() query: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) return { success: false, message: 'Vendor not found' };

    const { search, categoryId, limit = 100 } = query;

    const listings = await this.prisma.listing.findMany({
      where: {
        vendorId: vendor.id,
        AND: [
          search ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          categoryId ? { catalogProduct: { categoryId } } : {}
        ]
      },
      include: {
        catalogProduct: {
          include: {
            category: true,
            media: {
              where: { type: 'IMAGE' },
              take: 1
            }
          }
        }
      },
      take: Number(limit),
      orderBy: { updatedAt: 'desc' }
    });

    // Map to frontend structure
    const data = listings.map(l => ({
      id: l.id,
      name: l.title,
      sku: l.sku,
      price: l.price,
      stock: l.stock,
      status: l.status,
      image: l.catalogProduct?.media?.[0]?.url,
      Category: l.catalogProduct?.category
    }));

    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product stock' })
  @Patch('products/:id/stock')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateStock(
    @Param('id') id: string,
    @Body() body: { change: number; reason: string },
    @CurrentUser() user: any
  ) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) return { success: false, message: 'Vendor not found' };

    const listing = await this.prisma.listing.findFirst({
      where: { id, vendorId: vendor.id }
    });

    if (!listing) return { success: false, message: 'Listing not found' };

    const newStock = Math.max(0, listing.stock + body.change);

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { stock: newStock }
    });

    // Log the change if possible
    try {
      await (this.prisma as any).inventoryLog.create({
        data: {
          productId: id,
          vendorId: vendor.id,
          change: body.change,
          previousStock: listing.stock,
          newStock: newStock,
          reason: body.reason,
          createdAt: new Date()
        }
      });
    } catch (e) {
      // Ignore if table missing
    }

    return { success: true, data: updated };
  }

  @Public()
  @ApiOperation({ summary: 'Get vendor by slug', description: 'URL slug bilgisi verilen satıcının detaylarını ve mağaza bilgilerini döner.' })
  @ApiParam({ name: 'slug', description: 'Vendor slug (örn: awesome-store)' })
  @ApiResponse({ status: 200, description: 'Satıcı detayları.' })
  @ApiResponse({ status: 404, description: 'Satıcı bulunamadı.' })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.queryBus.execute(new GetVendorBySlugQuery(slug));
    return { success: true, data };
  }
}
