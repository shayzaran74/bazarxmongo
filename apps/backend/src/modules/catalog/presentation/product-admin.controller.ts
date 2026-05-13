// apps/backend/src/modules/catalog/presentation/product-admin.controller.ts

import {
  Controller, Get, Query, UseGuards,
  Delete, Param, Post, Body, Put,
  BadRequestException, Logger, NotFoundException,
} from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Trendyol title'ındaki tekrarlanan model adını temizler; 100 karakter üstünü kırpar
function cleanTrendyolTitle(raw: string): string {
  const s = (raw ?? '').trim()
  if (s.length <= 100) return s

  // Trendyol title'ı genellikle "Brand Model Specs Model Specs" şeklinde tekrarlıdır.
  // Orta noktaya yakın bir boşlukta ikinci kısım birinci kısımın başını içeriyorsa tekrar var demektir.
  const mid = Math.floor(s.length / 2)
  for (let offset = 0; offset <= 30; offset++) {
    for (const pos of [mid + offset, mid - offset]) {
      if (pos <= 0 || pos >= s.length) continue
      if (s[pos] !== ' ') continue
      const first = s.slice(0, pos).trim()
      const second = s.slice(pos).trim()
      const probe = second.slice(0, Math.min(20, second.length)).toLowerCase()
      if (probe.length > 5 && first.toLowerCase().includes(probe)) {
        // İkinci kısım birincide var → birinci kısmı döndür
        return first
      }
      const probe2 = first.slice(0, Math.min(20, first.length)).toLowerCase()
      if (probe2.length > 5 && second.toLowerCase().includes(probe2)) {
        return first
      }
    }
    if (offset === 0) continue
  }
  // Tekrar yoksa 100 karakterde kelime sınırında kes
  const cut = s.slice(0, 100)
  const lastSpace = cut.lastIndexOf(' ')
  return lastSpace > 50 ? cut.slice(0, lastSpace) : cut
}

// Trendyol ham açıklamasını temizler; boilerplate satırları platform bilgisi olarak ayırır
function parseTrendyolDescription(raw: string): { cleanDescription: string; platformInfo: string; stock: number } {
  if (!raw?.trim()) return { cleanDescription: '', platformInfo: '', stock: 1 };

  // Stok miktarını metinden çıkar
  let stock = 1;
  const moreMatch = raw.match(/(\d+)\s*adetten fazla stok/i);
  if (moreMatch) stock = Math.max(parseInt(moreMatch[1], 10), 1);
  const lessMatch = raw.match(/(\d+)\s*adetten az stok/i);
  if (lessMatch && !moreMatch) stock = Math.max(parseInt(lessMatch[1], 10), 1);

  // "Ürün Özellikleri:" bölümü attributes'da zaten var — öncesini al
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
import { PrismaService } from '@barterborsa/shared-persistence';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ListAdminProductsQuery } from '../application/queries/list-admin-products/list-admin-products.query';
import { GetProductStatsQuery } from '../application/queries/get-product-stats.query';
import { GetImportJobStatusQuery } from '../application/queries/get-import-job-status.query';
import { ListImportJobsQuery } from '../application/queries/list-import-jobs.query';
import { DeleteAdminProductCommand } from '../application/commands/delete-admin-product.command';
import { BulkDeleteAdminProductsCommand } from '../application/commands/bulk-delete-admin-products.command';
import { BulkUpdateAdminProductsCommand } from '../application/commands/bulk-update-admin-products.command';
import { UpdateAdminProductCommand } from '../application/commands/update-admin-product.command';
import { CreateAdminProductCommand } from '../application/commands/create-admin-product.command';
import { QueueImportProductsCommand } from '../application/commands/queue-import-products.command';

interface AuthenticatedUser {
  id: string;
  role: string;
}

// Trendyol JSON çıktısının tek ürün şeması
class TrendyolProductDto {
  @IsString()
  external_id!: string;

  @IsString()
  title!: string;

  @IsNumber()
  price!: number;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>;
}

class ImportTrendyolDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrendyolProductDto)
  products!: TrendyolProductDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultStock?: number;

  @IsString()
  @IsOptional()
  vendorType?: string; // 'COMMERCE' | 'RESTAURANT'
}

@ApiTags('Product Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/products')
export class ProductAdminController {
  private readonly logger = new Logger(ProductAdminController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ─── Stats ─────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get product statistics' })
  @Get('stats')
  async getStats() {
    const data = await this.queryBus.execute(new GetProductStatsQuery());
    return { success: true, data };
  }

  // ─── Bulk Import (Queue tabanlı) ────────────────────────────────────────────

  @ApiOperation({
    summary: 'Queue bulk product import',
    description:
      'Satırları kuyruğa alır ve anında jobId döner. ' +
      'GET /admin/products/import-jobs/:jobId ile durumu takip edin. ' +
      'Limit: 50.000 satır.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          maxItems: 50000,
          items: {
            type: 'object',
            properties: {
              name:           { type: 'string', example: 'iPhone 15 Pro' },
              description:    { type: 'string' },
              price:          { type: 'number', example: 49999 },
              stock:          { type: 'number', example: 100 },
              sku:            { type: 'string', example: 'IPH15PRO-256' },
              categoryId:     { type: 'string', format: 'uuid' },
              brandId:        { type: 'string', format: 'uuid' },
              brandName:      { type: 'string', example: 'Apple' },
              status:         { type: 'string', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
              isFeatured:     { type: 'boolean' },
              isSpecialOffer: { type: 'boolean' },
              isFlashSale:    { type: 'boolean' },
              productImages:  { type: 'array', items: { type: 'string' } },
            },
            required: ['name'],
          },
        },
      },
      required: ['rows'],
    },
  })
  @Post('bulk-import')
  async bulkImport(
    @Body('rows') rows: unknown[],
    @Query('vendorType') vendorType: string = 'COMMERCE',
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!Array.isArray(rows)) {
      throw new BadRequestException('rows alanı bir dizi olmalıdır');
    }
    this.logger.log(`Bulk import isteği: ${rows.length} satır — type: ${vendorType} — admin: ${user.id}`);
    return this.commandBus.execute(new QueueImportProductsCommand(rows, user.id, vendorType));
  }

  // ─── Import Job Durumu (Polling endpoint) ───────────────────────────────────

  @ApiOperation({
    summary: 'Get import job status',
    description:
      'Frontend 2 saniyede bir bu endpoint\'i çağırarak ilerlemeyi gösterir. ' +
      'status: PENDING | PROCESSING | COMPLETED | FAILED',
  })
  @ApiParam({ name: 'jobId', type: 'string', format: 'uuid' })
  @Get('import-jobs/:jobId')
  async getImportJobStatus(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.queryBus.execute(new GetImportJobStatusQuery(jobId, user.id));
    return { success: true, data };
  }

  // ─── Admin'in import geçmişi ────────────────────────────────────────────────

  @ApiOperation({ summary: 'List import jobs for current admin' })
  @Get('import-jobs')
  async listImportJobs(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.queryBus.execute(
      new ListImportJobsQuery(user.id, Number(page) || 1, Number(limit) || 20),
    );

    return {
      success: true,
      data: result.items,
      pagination: { total: result.total, page: result.page, limit: result.limit },
    };
  }

  // ─── Trendyol JSON İçe Aktarım ─────────────────────────────────────────────

  @ApiOperation({
    summary: 'Trendyol JSON formatından toplu ürün içe aktarımı',
    description: 'Trendyol scraper çıktısı olan JSON dizisini mevcut bulk-import kuyruğuna dönüştürür.',
  })
  @ApiBody({ type: ImportTrendyolDto })
  @Post('import-trendyol')
  async importFromTrendyol(
    @Body() dto: ImportTrendyolDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!Array.isArray(dto.products) || dto.products.length === 0) {
      throw new BadRequestException('products dizisi boş olamaz');
    }

    // Trendyol şemasını mevcut bulk-import satır formatına dönüştür
    const rows = dto.products.map((p) => {
      const cleanTitle = cleanTrendyolTitle(p.title);
      const { cleanDescription, platformInfo, stock: parsedStock } = parseTrendyolDescription(p.description ?? '');
      const finalStock = parsedStock > 1 ? parsedStock : (dto.defaultStock ?? 1);
      // Temiz açıklama yoksa temizlenmiş ürün adını kullan; platform bilgisini specs'e göm
      const description = cleanDescription || cleanTitle;
      const specs: Record<string, unknown> = { ...(p.attributes ?? {}) };
      if (platformInfo) specs['_platformInfo'] = platformInfo;
      // Marka: subcategory daha temiz (ör: "Apple"), p.brand genellikle tam title tekrarı
      const trendyolSub = (p as unknown as { subcategory?: string }).subcategory ?? ''
      const brandName = trendyolSub || p.brand || '';
      // categoryId geçilmez → worker kendi varsayılanını kullanır (subcategory kategori olarak yazılmaz)

      return {
        name: cleanTitle,
        description,
        price: p.price,
        stock: finalStock,
        sku: `TY-${p.external_id}`,
        brandName,
        status: 'ACTIVE',
        productImages: p.image_url ? [p.image_url] : [],
        specs,
      };
    });

    this.logger.log(`Trendyol import: ${rows.length} ürün — type: ${dto.vendorType || 'COMMERCE'} — admin: ${user.id}`);
    return this.commandBus.execute(new QueueImportProductsCommand(rows, user.id, dto.vendorType || 'COMMERCE'));
  }

  // ─── CRUD endpointleri ──────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create a single product' })
  @Post()
  async createProduct(@Body() data: Record<string, unknown>, @CurrentUser() user: AuthenticatedUser) {
    return this.commandBus.execute(new CreateAdminProductCommand(data, user.id));
  }

  @ApiOperation({ summary: 'List all products for admin' })
  @Get()
  async getProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('q') search?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('vendorOnly') vendorOnly?: string,
  ) {
    const result = await this.queryBus.execute(
      new ListAdminProductsQuery({
        search,
        status,
        categoryId,
        vendorId,
        vendorOnly: vendorOnly === 'true',
        page: Number(page) || 1,
        limit: Number(limit) || 50,
      }),
    );
    return {
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @ApiOperation({ summary: 'Delete a product' })
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteAdminProductCommand(id));
  }

  @ApiOperation({ summary: 'Bulk delete products' })
  @Post('bulk-delete')
  async bulkDelete(@Body('ids') ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('ids alanı boş bir dizi olamaz');
    }
    return this.commandBus.execute(new BulkDeleteAdminProductsCommand(ids));
  }

  @ApiOperation({ summary: 'Bulk update products' })
  @Put('bulk-update')
  async bulkUpdate(@Body() body: { ids: string[]; updates: Record<string, unknown> }) {
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('ids alanı boş bir dizi olamaz');
    }
    return this.commandBus.execute(
      new BulkUpdateAdminProductsCommand(body.ids, body.updates),
    );
  }

  @ApiOperation({ summary: 'Update a product' })
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.commandBus.execute(new UpdateAdminProductCommand(id, data));
  }
}
