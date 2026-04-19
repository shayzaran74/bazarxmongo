import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
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

  @Public()
  @ApiOperation({ summary: 'List vendors', description: 'Sistemdeki satıcıları listeler. Sayfalama ve filtreleme destekler.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Satıcı listesi.' })
  @Get()
  async list(@Query() query: any) {
    return this.queryBus.execute(new ListVendorsQuery(query));
  }

  @Public()
  @ApiOperation({ summary: 'Get vendor by slug', description: 'URL slug bilgisi verilen satıcının detaylarını ve mağaza bilgilerini döner.' })
  @ApiParam({ name: 'slug', description: 'Vendor slug (örn: awesome-store)' })
  @ApiResponse({ status: 200, description: 'Satıcı detayları.' })
  @ApiResponse({ status: 404, description: 'Satıcı bulunamadı.' })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.queryBus.execute(new GetVendorBySlugQuery(slug));
  }
}
