import { Controller, Get, Post, Body, UploadedFile, UseGuards, UseInterceptors, Res, Param, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import * as XLSX from 'xlsx';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

interface AuthenticatedUser {
  id: string;
  role: string;
}

@ApiTags('Vendor Inventory')
@ApiBearerAuth()
@Controller('vendors/inventory')
export class VendorInventoryController {
  private readonly logger = new Logger(VendorInventoryController.name);
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Get inventory stats' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  async getStats(@CurrentUser() user: AuthenticatedUser) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) return { success: false, message: 'Vendor not found' };

    const listings = await this.prisma.listing.findMany({
      where: { vendorId: vendor.id }
    });

    const totalProducts = listings.length;
    const outOfStock = listings.filter(l => l.stock === 0).length;
    const lowStock = listings.filter(l => l.stock > 0 && l.stock <= 5).length;
    const healthyStock = listings.filter(l => l.stock > 5).length;

    return {
      success: true,
      data: {
        totalProducts,
        outOfStock,
        lowStock,
        healthyStock
      }
    };
  }

  @ApiOperation({ summary: 'Export inventory to Excel' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('export')
  async exportExcel(@CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id }
    });

    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    const listings = await this.prisma.listing.findMany({
      where: { vendorId: vendor.id },
      include: {
        catalogProduct: {
          include: { category: true }
        }
      }
    });

    const exportData = listings.map(l => ({
      'ID': l.id,
      'Ürün Adı': l.title,
      'SKU': l.sku || '-',
      'Stok': l.stock,
      'Fiyat': l.price,
      'Kategori': l.catalogProduct?.category?.name || '-',
      'Durum': l.status
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Envanter');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=envanter_${new Date().getTime()}.xlsx`);
    res.send(buffer);
  }

  @ApiOperation({ summary: 'Get product stock history' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('logs/:productId')
  async getLogs(@Param('productId') productId: string, @CurrentUser() user: AuthenticatedUser) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) return { success: true, data: [] };

    // Stok geçmişini vendorId + listingId ile güvenli çek
    try {
      const logs = await this.prisma.inventoryLog.findMany({
        where: { listingId: productId, vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return { success: true, data: logs };
    } catch {
      return { success: true, data: [] };
    }
  }

  @ApiOperation({ summary: 'Download product upload template' })
  @Public()
  @Get('template/download')
  async downloadTemplate(@Res() res: Response) {
    // ... existing template logic ...
    let filePath = path.join(process.cwd(), '..', '..', 'belge', 'exel', 'bazarx_trendyol_sablonu01.xlsx');
    if (!fs.existsSync(filePath)) filePath = path.join(process.cwd(), 'belge', 'exel', 'bazarx_trendyol_sablonu01.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Şablon dosyası bulunamadı.' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=bazarx_urun_yukleme_sablonu.xlsx');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @ApiOperation({ summary: 'Import products from Excel' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('import-excel')
  async importExcel(@UploadedFile() file: any, @CurrentUser() user: AuthenticatedUser) {
    // ... existing import logic remains same ...
    if (!file) return { success: false, error: 'Dosya yüklenmedi' };
    
    try {
      const vendor = await this.prisma.vendor.findUnique({ where: { userId: user.id } });
      if (!vendor) return { success: false, error: 'Vendor not found' };

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Simplify to first sheet
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          const rawName = row['Başlık'] || row['Ürün Adı'] || row['Stok Kartı Adı'];
          if (!rawName) continue;
          
          const barcode = String(row['Barkod'] || row['Stok Kodu'] || '');
          // Esnek fiyat ve stok eşleşmesi
          const price = parseFloat(String(row['Satış Fiyatı'] || row['Fiyat'] || '0').replace(',', '.'));
          const stock = parseInt(String(row['Stok Adedi'] || row['Envanter Miktar'] || '0'), 10);
          const categoryName = row['Kategori'] || 'Genel';
          
          // Resimleri çek (Akıllı Tespit: URL içeren herhangi bir kolonu kontrol et)
          let images: string[] = [];
          Object.values(row).forEach(val => {
            if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('//')) && 
                (val.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) || val.includes('dsmcdn.com'))) {
              images.push(val.trim());
            }
          });
          

          const slug = this.slugify(`${rawName}-${barcode || require('crypto').randomBytes(4).toString('hex')}`);

          const category = await this.prisma.category.upsert({
            where: { slug: this.slugify(categoryName) },
            update: {},
            create: { name: categoryName, slug: this.slugify(categoryName), isActive: true }
          });

          const catalogProduct = await this.prisma.catalogProduct.upsert({
            where: { slug },
            update: { name: rawName },
            create: { 
              name: rawName, 
              slug, 
              categoryId: category.id, 
              status: 'ACTIVE', 
              brand: row['Marka'] || 'Genel', 
              description: rawName
            }
          });

          // Resimleri ayrıca işle (Hem yeni hem eski ürünler için)
          if (images.length > 0) {
            // Mevcut resimleri temizle ve yenilerini ekle (veya sadece eksikleri ekle)
            // Basitlik için mevcutları silip yenileri ekliyoruz
            await this.prisma.productMedia.deleteMany({
              where: { productId: catalogProduct.id }
            });

            await this.prisma.productMedia.createMany({
              data: images.map((url, idx) => ({
                productId: catalogProduct.id,
                url: url.trim(),
                type: 'IMAGE',
                sortOrder: idx
              }))
            });
          }

          // Güvenli güncelleme: slug ile upsert yerine vendorId'ye göre eşleştir.
          // Slug tabanlı upsert başka vendor'ın listing'ini ezebilir.
          const existingListing = await this.prisma.listing.findFirst({
            where: { vendorId: vendor.id, sku: barcode || undefined },
          });

          if (existingListing) {
            await this.prisma.listing.update({
              where: { id: existingListing.id },
              data: { price, stock },
            });
          } else {
            // Çakışmayı önlemek için slug'a vendor prefix ekle
            const safeSlug = `v${vendor.id.slice(0, 8)}-${slug}`;
            await this.prisma.listing.create({
              data: {
                vendorId: vendor.id,
                catalogProductId: catalogProduct.id,
                title: rawName,
                slug: safeSlug,
                price,
                stock,
                sku: barcode,
                status: 'PENDING',
                listingType: 'SELL',
              },
            });
          }

          successCount++;
        } catch (err: any) {
          failedCount++;
          errors.push(`${row['Başlık'] || 'Bilinmeyen'}: ${err.message}`);
        }
      }

      return { success: true, results: { success: successCount, failed: failedCount, errors } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @ApiOperation({ summary: 'Trendyol JSON formatından ürün içe aktarımı (Vendor)' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('import-trendyol')
  async importTrendyol(
    @Body('products') products: Record<string, unknown>[],
    @Body('defaultStock') defaultStock: number | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!Array.isArray(products) || products.length === 0) {
      throw new BadRequestException('products dizisi boş olamaz');
    }

    const vendor = await this.prisma.vendor.findUnique({ where: { userId: user.id } });
    if (!vendor) return { success: false, error: 'Vendor bulunamadı' };

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const raw of products) {
      try {
        const externalId = String(raw['external_id'] ?? '');
        const rawTitle = String(raw['title'] ?? '');
        if (!rawTitle) continue;
        const title = this.cleanTrendyolTitle(rawTitle);

        const price = Number(raw['price'] ?? 0);
        const imageUrls = this.extractImageUrls(raw);
        const rawSubcategory = typeof raw['subcategory'] === 'string' ? raw['subcategory'] : '';
        const explicitBrand = typeof raw['brand'] === 'string' ? raw['brand'] : null;
        const brandRaw = explicitBrand || (rawSubcategory ? rawSubcategory.split('>')[0].trim() : 'Genel');
        
        // Marka ismini temizle: Eğer çok uzunsa veya içinde boşluk varsa ilk kelimeyi al (Ör: Samsung Galaxy -> Samsung)
        let brand = brandRaw.trim();
        if (brand.length > 20 || brand.includes(' ')) {
          brand = brand.split(' ')[0].trim();
        }
        // Güvenlik: 50 karakterden uzun markaları kes
        brand = brand.length > 50 ? brand.slice(0, 50) : brand;
        const rawDesc = typeof raw['description'] === 'string' ? raw['description'] : '';
        const { cleanDescription, platformInfo, stock: parsedStock } = this.parseTrendyolDesc(rawDesc);
        const description = cleanDescription || title;
        // Stok: description'dan parse et; yoksa defaultStock ya da 1 kullan
        const stockToUse = parsedStock > 1 ? parsedStock : (Number(defaultStock) > 0 ? Number(defaultStock) : 1);
        const sku = `TY-${externalId}`;

        const slug = this.slugify(`${title}-${externalId}`);
        // --- Hierarchical Category Setup ---
        const categoryParts = rawSubcategory 
          ? rawSubcategory.split('>').map(p => p.trim()).filter(p => p && p.length > 2 && !p.includes(title.slice(0, 10))) 
          : ['Genel'];

        // Limit depth to 4 levels for sanity
        const activeParts = categoryParts.slice(0, 4);
        
        let lastCategoryId: string | null = null;
        let lastCategory: any = null;

        for (const partName of activeParts) {
          const partSlug = this.slugify(partName);
          lastCategory = await this.prisma.category.upsert({
            where: { slug: partSlug },
            update: { isActive: true },
            create: {
              name: partName,
              slug: partSlug,
              parentId: lastCategoryId,
              isActive: true
            },
          });
          lastCategoryId = lastCategory.id;
        }

        const category = lastCategory;

        // Specs: attributes + platform bilgisi
        const attrs = raw['attributes'] as Record<string, unknown> | null | undefined;
        const specs: any = { ...(attrs ?? {}) };
        if (platformInfo) specs['_platformInfo'] = platformInfo;

        const catalogProduct = await this.prisma.catalogProduct.upsert({
          where: { slug },
          update: { name: title, description, specs },
          create: {
            name: title,
            slug,
            categoryId: category.id,
            status: 'ACTIVE',
            brand,
            description,
            specs,
          },
        });

        if (imageUrls.length > 0) {
          this.logger.log(`[TrendyolImport] ${imageUrls.length} görsel bulundu: ${imageUrls.join(', ')}`);
          await this.prisma.productMedia.deleteMany({ where: { productId: catalogProduct.id } });
          await this.prisma.productMedia.createMany({
            data: imageUrls.map((url, idx) => ({
              productId: catalogProduct.id,
              url,
              type: 'IMAGE',
              sortOrder: idx,
            })),
          });
        } else {
          this.logger.warn(`[TrendyolImport] Hiç görsel bulunamadı for product: ${title}`);
        }

        const existingListing = await this.prisma.listing.findFirst({
          where: { vendorId: vendor.id, sku },
        });

        if (existingListing) {
          await this.prisma.listing.update({
            where: { id: existingListing.id },
            data: { price, stock: stockToUse },
          });
        } else {
          const safeSlug = `v${vendor.id.slice(0, 8)}-${slug}`;
          await this.prisma.listing.create({
            data: {
              vendorId: vendor.id,
              catalogProductId: catalogProduct.id,
              title,
              slug: safeSlug,
              price,
              stock: stockToUse,
              sku,
              status: 'PENDING',
              listingType: 'SELL',
            },
          });
        }

        successCount++;
      } catch (err: unknown) {
        failedCount++;
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        errors.push(`${String(raw['title'] ?? 'Bilinmeyen')}: ${msg}`);
      }
    }

    return { success: true, results: { success: successCount, failed: failedCount, errors } };
  }

  private cleanTrendyolTitle(raw: string): string {
    const s = (raw ?? '').trim()
    if (s.length <= 100) return s
    const mid = Math.floor(s.length / 2)
    for (let offset = 0; offset <= 30; offset++) {
      for (const pos of [mid + offset, mid - offset]) {
        if (pos <= 0 || pos >= s.length || s[pos] !== ' ') continue
        const first = s.slice(0, pos).trim()
        const second = s.slice(pos).trim()
        const probe = second.slice(0, Math.min(20, second.length)).toLowerCase()
        if (probe.length > 5 && first.toLowerCase().includes(probe)) return first
        const probe2 = first.slice(0, Math.min(20, first.length)).toLowerCase()
        if (probe2.length > 5 && second.toLowerCase().includes(probe2)) return first
      }
      if (offset === 0) continue
    }
    const cut = s.slice(0, 100)
    const lastSpace = cut.lastIndexOf(' ')
    const finalTitle = lastSpace > 50 ? cut.slice(0, lastSpace) : cut
    
    // Title Case Dönüşümü (Baş harf büyük, gerisi küçük)
    return finalTitle.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private parseTrendyolDesc(raw: string): { cleanDescription: string; platformInfo: string; stock: number } {
    if (!raw.trim()) return { cleanDescription: '', platformInfo: '', stock: 1 };

    let stock = 1;
    const moreMatch = raw.match(/(\d+)\s*adetten fazla stok/i);
    if (moreMatch) stock = Math.max(parseInt(moreMatch[1], 10), 1);
    const lessMatch = raw.match(/(\d+)\s*adetten az stok/i);
    if (lessMatch && !moreMatch) stock = Math.max(parseInt(lessMatch[1], 10), 1);

    const specsIdx = raw.indexOf('Ürün Özellikleri:');
    const relevantPart = specsIdx >= 0 ? raw.slice(0, specsIdx) : raw;

    const BOILERPLATE = [
      /^Bu ürün\b/i,
      /tarafından gönderilecektir/i,
      /^Kampanya fiyatından/i,
      /^Ürüne ait garanti belgesi/i,
      /^Ürün teslimi sonrası/i,
      /^Bir ürün, birden fazla satıcı/i,
      /^Bu üründen en fazla/i,
      /^Belirlenen bu limit/i,
      /adetten fazla stok/i,
      /adetten az stok/i,
      /link ve karekod/i,
      /sıralanmaktadır\.?\s*$/i,
    ];

    const platformLines: string[] = [];
    const cleanLines: string[] = [];
    for (const line of relevantPart.split(/\n/).map(l => l.trim()).filter(Boolean)) {
      if (BOILERPLATE.some(p => p.test(line))) {
        platformLines.push(line);
      } else {
        cleanLines.push(line);
      }
    }
    return {
      cleanDescription: cleanLines.join('\n').trim(),
      platformInfo: platformLines.join('\n').trim(),
      stock,
    };
  }

  private slugify(text: string): string {
    const trMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
    };
    return text.toString().split('').map(c => trMap[c] || c).join('').toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  private extractImageUrls(raw: Record<string, unknown>): string[] {
    const urls: string[] = [];

    // 1. `image_urls` dizisi (Trendyo format)
    if (Array.isArray(raw['image_urls'])) {
      for (const url of raw['image_urls']) {
        if (typeof url === 'string' && this.isValidImageUrl(url)) {
          urls.push(url);
        }
      }
    }

    // 2. `image_url` tek string
    if (!urls.length && typeof raw['image_url'] === 'string' && this.isValidImageUrl(raw['image_url'])) {
      urls.push(raw['image_url']);
    }

    // 3. Smart Detection: tüm alanlarda URL ara
    if (!urls.length) {
      for (const val of Object.values(raw)) {
        if (typeof val === 'string' && this.isValidImageUrl(val)) {
          urls.push(val);
          break; // İlk geçerli URL yeterli, yoksa tümünü al
        }
      }
    }

    return urls;
  }

  private isValidImageUrl(url: string): boolean {
    return url.startsWith('http') &&
      (url.includes('dsmcdn.com') ||
       url.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) !== null);
  }
}
