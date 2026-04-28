// apps/backend/src/modules/vendor/presentation/vendor-product.controller.ts
// Değişen kısım: bulkImport metodu — Excel/CSV parse eklendi

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Logger,
  BadRequestException, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateVendorProductCommand } from '../application/commands/create-vendor-product.command';
import { UpdateVendorProductCommand } from '../application/commands/update-vendor-product.command';
import { DeleteVendorProductCommand } from '../application/commands/delete-vendor-product.command';
import { ListVendorProductsQuery } from '../application/queries/list-vendor-products.query';

const XLSX_MIME = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
];
const MAX_ROWS = 5_000;

@ApiTags('Vendors-Products')
@Controller('vendors/products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
export class VendorProductController {
  private readonly logger = new Logger(VendorProductController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Excel/CSV dosyasından toplu ürün içe aktar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @Post('bulk/import')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
      if (XLSX_MIME.includes(file.mimetype) ||
          file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Sadece Excel (.xlsx/.xls) ve CSV dosyaları kabul edilir'), false);
      }
    },
  }))
  async bulkImport(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Lütfen bir dosya yükleyin.');

    this.logger.log(`Bulk import: user=${user.id}, file=${file.originalname}, size=${file.size}`);

    // Excel / CSV parse
    let rows: any[] = [];
    const isCSV = file.originalname.match(/\.csv$/i) || file.mimetype === 'text/csv';

    if (isCSV) {
      rows = this.parseCSV(file.buffer.toString('utf-8'));
    } else {
      rows = await this.parseExcel(file.buffer);
    }

    if (rows.length === 0) {
      throw new BadRequestException('Dosyada işlenebilir satır bulunamadı');
    }
    if (rows.length > MAX_ROWS) {
      throw new BadRequestException(
        `Maksimum ${MAX_ROWS.toLocaleString('tr-TR')} satır yüklenebilir (gönderilen: ${rows.length})`,
      );
    }

    // Vendor'ı bul
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) throw new BadRequestException('Satıcı hesabı bulunamadı');

    // Satırları işle
    const results = { created: 0, updated: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const name = row['name'] || row['ürün adı'] || row['product_name'] || row['title'];
        if (!name) {
          results.errors.push(`Satır ${i + 2}: Ürün adı zorunlu`);
          results.failed++;
          continue;
        }

        const price = parseFloat(row['price'] || row['fiyat'] || '0');
        const stock = parseInt(row['stock'] || row['stok'] || '0', 10);
        const barcode = row['barcode'] || row['barkod'];
        const categoryId = row['categoryId'] || row['category_id'];

        // Barkod varsa güncelle, yoksa oluştur
        if (barcode) {
          const existing = await this.prisma.listing.findFirst({
            where: { vendorId: vendor.id, barcode },
          });

          if (existing) {
            await this.prisma.listing.update({
              where: { id: existing.id },
              data: {
                ...(price > 0 && { price }),
                ...(stock >= 0 && { stock }),
              },
            });
            results.updated++;
            continue;
          }
        }

        // Katalog ürününü bul veya oluştur (Listing için zorunlu)
        let catalogProduct = await this.prisma.catalogProduct.findFirst({
          where: { name },
        });

        if (!catalogProduct) {
          catalogProduct = await this.prisma.catalogProduct.create({
            data: {
              name,
              slug:        this.toSlug(name) + '-cat',
              brand:       row['brand'] || row['marka'] || 'Genel',
              description: row['description'] || row['açıklama'] || name,
              categoryId:  categoryId || null,
            },
          });
        }

        // Yeni listing oluştur
        await this.prisma.listing.create({
          data: {
            vendorId:         vendor.id,
            catalogProductId: catalogProduct.id,
            categoryId:       categoryId || null,
            title:            name,
            price:            price || 0,
            stock:            stock || 0,
            barcode:          barcode || null,
            status:           'ACTIVE',
            slug:             this.toSlug(name),
          },
        });
        results.created++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Satır ${i + 2}: ${err.message}`);
      }
    }

    this.logger.log(
      `Bulk import tamamlandı: created=${results.created}, updated=${results.updated}, failed=${results.failed}`,
    );

    return {
      success: true,
      message: `${results.created} oluşturuldu, ${results.updated} güncellendi${results.failed > 0 ? `, ${results.failed} hatalı` : ''}`,
      data: results,
    };
  }

  // ─── Yardımcı metodlar ────────────────────────────────────────────────────

  private parseCSV(content: string): any[] {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });
      return row;
    });
  }

  private async parseExcel(buffer: Buffer): Promise<any[]> {
    try {
      // xlsx paketi runtime'da yükleniyor — build-time bağımlılık değil
      // pnpm add xlsx --filter @bazarx/backend ile kurulmalı
      const XLSX = require('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      return rows.map((row: any) => {
        // Türkçe header normalleştirme
        const normalized: any = {};
        Object.entries(row).forEach(([k, v]) => {
          normalized[k.toLowerCase().trim()] = v;
        });
        return normalized;
      });
    } catch {
      throw new BadRequestException(
        'Excel dosyası işlenemedi. xlsx paketi kurulu olmalı: pnpm add xlsx --filter @bazarx/backend',
      );
    }
  }

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's')
      .replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }

  // ─── Diğer endpoint'ler (değişmedi) ──────────────────────────────────────

  @ApiOperation({ summary: 'Satıcının ürünlerini listele' })
  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('q') search?: string,
  ) {
    const data = await this.queryBus.execute(
      new ListVendorProductsQuery(user.id, {
        search,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 50,
      }),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Yeni ürün/listing oluştur' })
  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    return this.commandBus.execute(new CreateVendorProductCommand(user.id, body));
  }

  @ApiOperation({ summary: 'Ürün güncelle' })
  @Put(':id')
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.commandBus.execute(new UpdateVendorProductCommand(user.id, id, body));
  }

  @ApiOperation({ summary: 'Ürün sil' })
  @Delete(':id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteVendorProductCommand(user.id, id));
  }
}
