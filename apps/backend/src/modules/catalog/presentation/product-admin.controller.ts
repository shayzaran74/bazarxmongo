// apps/backend/src/modules/catalog/presentation/product-admin.controller.ts

import {
  Controller, Get, Query, UseGuards,
  Delete, Param, Post, Body, Put,
  BadRequestException, Logger,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ListAdminProductsQuery }         from '../application/queries/list-admin-products/list-admin-products.query';
import { GetProductStatsQuery }           from '../application/queries/get-product-stats.query';
import { GetImportJobStatusQuery }        from '../application/queries/get-import-job-status.query';
import { ListImportJobsQuery }            from '../application/queries/list-import-jobs.query';
import { DeleteAdminProductCommand }      from '../application/commands/delete-admin-product.command';
import { BulkDeleteAdminProductsCommand } from '../application/commands/bulk-delete-admin-products.command';
import { BulkUpdateAdminProductsCommand } from '../application/commands/bulk-update-admin-products.command';
import { UpdateAdminProductCommand }      from '../application/commands/update-admin-product.command';
import { CreateAdminProductCommand }      from '../application/commands/create-admin-product.command';
import { QueueImportProductsCommand }     from '../application/commands/queue-import-products.command';

interface AuthenticatedUser { id: string; role: string }

function cleanTrendyolTitle(raw: string): string {
  const s = (raw ?? '').trim();
  if (s.length <= 100) return s;
  const mid = Math.floor(s.length / 2);
  for (let offset = 0; offset <= 30; offset++) {
    for (const pos of [mid + offset, mid - offset]) {
      if (pos <= 0 || pos >= s.length || s[pos] !== ' ') continue;
      const first = s.slice(0, pos).trim();
      const second = s.slice(pos).trim();
      const probe = second.slice(0, Math.min(20, second.length)).toLowerCase();
      if (probe.length > 5 && first.toLowerCase().includes(probe)) return first;
      const probe2 = first.slice(0, Math.min(20, first.length)).toLowerCase();
      if (probe2.length > 5 && second.toLowerCase().includes(probe2)) return first;
    }
    if (offset === 0) continue;
  }
  const cut = s.slice(0, 100);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 50 ? cut.slice(0, lastSpace) : cut;
}

function parseTrendyolDescription(raw: string): { cleanDescription: string; platformInfo: string; stock: number } {
  if (!raw?.trim()) return { cleanDescription: '', platformInfo: '', stock: 1 };
  let stock = 1;
  const moreMatch = raw.match(/(\d+)\s*adetten fazla stok/i);
  if (moreMatch) stock = Math.max(parseInt(moreMatch[1], 10), 1);
  const lessMatch = raw.match(/(\d+)\s*adetten az stok/i);
  if (lessMatch && !moreMatch) stock = Math.max(parseInt(lessMatch[1], 10), 1);
  const specsIdx = raw.indexOf('Ürün Özellikleri:');
  const relevantPart = specsIdx >= 0 ? raw.slice(0, specsIdx) : raw;
  const BOILERPLATE = [/^Bu ürün\b/i, /tarafından gönderilecektir/i, /adetten fazla stok/i, /adetten az stok/i];
  const platformLines: string[] = [];
  const cleanLines: string[] = [];
  for (const line of relevantPart.split(/\n/).map(l => l.trim()).filter(Boolean)) {
    if (BOILERPLATE.some(p => p.test(line))) platformLines.push(line);
    else cleanLines.push(line);
  }
  return { cleanDescription: cleanLines.join('\n').trim(), platformInfo: platformLines.join('\n').trim(), stock };
}

class TrendyolProductDto {
  @IsString() external_id!: string;
  @IsString() title!: string;
  @IsNumber() price!: number;
  @IsString() @IsOptional() image_url?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() brand?: string;
  @IsObject() @IsOptional() attributes?: Record<string, string>;
}
class ImportTrendyolDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => TrendyolProductDto) products!: TrendyolProductDto[];
  @IsNumber() @Min(0) @IsOptional() defaultStock?: number;
  @IsString() @IsOptional() vendorType?: string;
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
    private readonly queryBus:   QueryBus,
  ) {}

  @Get('stats')
  async getStats() {
    const data = await this.queryBus.execute(new GetProductStatsQuery());
    return { success: true, data };
  }

  @Post('bulk-import')
  async bulkImport(@Body('rows') rows: unknown[], @Query('vendorType') vendorType = 'COMMERCE', @CurrentUser() user: AuthenticatedUser) {
    if (!Array.isArray(rows)) throw new BadRequestException('rows alanı bir dizi olmalıdır');
    this.logger.log(`Bulk import: ${rows.length} satır — ${vendorType} — ${user.id}`);
    return this.commandBus.execute(new QueueImportProductsCommand(rows, user.id, vendorType));
  }

  @Get('import-jobs/:jobId')
  getImportJobStatus(@Param('jobId') jobId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.queryBus.execute(new GetImportJobStatusQuery(jobId, user.id)).then(data => ({ success: true, data }));
  }

  @Get('import-jobs')
  async listImportJobs(@CurrentUser() user: AuthenticatedUser, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.queryBus.execute(new ListImportJobsQuery(user.id, Number(page) || 1, Number(limit) || 20));
    return { success: true, data: result.items, pagination: { total: result.total, page: result.page, limit: result.limit } };
  }

  @Post('import-trendyol')
  async importFromTrendyol(@Body() dto: ImportTrendyolDto, @CurrentUser() user: AuthenticatedUser) {
    if (!dto.products?.length) throw new BadRequestException('products dizisi boş olamaz');
    const rows = dto.products.map(p => {
      const cleanTitle = cleanTrendyolTitle(p.title);
      const { cleanDescription, platformInfo, stock: parsedStock } = parseTrendyolDescription(p.description ?? '');
      const finalStock = parsedStock > 1 ? parsedStock : (dto.defaultStock ?? 1);
      const specs: Record<string, unknown> = { ...(p.attributes ?? {}) };
      if (platformInfo) specs['_platformInfo'] = platformInfo;
      return { name: cleanTitle, description: cleanDescription || cleanTitle, price: p.price, stock: finalStock, sku: `TY-${p.external_id}`, brandName: p.brand || '', status: 'ACTIVE', productImages: p.image_url ? [p.image_url] : [], specs };
    });
    return this.commandBus.execute(new QueueImportProductsCommand(rows, user.id, dto.vendorType || 'COMMERCE'));
  }

  @Post() createProduct(@Body() data: Record<string, unknown>, @CurrentUser() user: AuthenticatedUser) { return this.commandBus.execute(new CreateAdminProductCommand(data, user.id)); }

  @Get()
  async getProducts(@Query('page') page = 1, @Query('limit') limit = 50, @Query('q') search?: string, @Query('status') status?: string, @Query('categoryId') categoryId?: string, @Query('vendorId') vendorId?: string, @Query('vendorOnly') vendorOnly?: string) {
    const result = await this.queryBus.execute(new ListAdminProductsQuery({ search, status, categoryId, vendorId, vendorOnly: vendorOnly === 'true', page: Number(page) || 1, limit: Number(limit) || 50 }));
    return { success: true, data: result.items, pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: Math.ceil(result.total / result.limit) } };
  }

  @Delete(':id') deleteProduct(@Param('id') id: string) { return this.commandBus.execute(new DeleteAdminProductCommand(id)); }

  @Post('bulk-delete')
  async bulkDelete(@Body('ids') ids: string[]) {
    if (!Array.isArray(ids) || !ids.length) throw new BadRequestException('ids alanı boş bir dizi olamaz');
    return this.commandBus.execute(new BulkDeleteAdminProductsCommand(ids));
  }

  @Put('bulk-update')
  async bulkUpdate(@Body() body: { ids: string[]; updates: Record<string, unknown> }) {
    if (!Array.isArray(body.ids) || !body.ids.length) throw new BadRequestException('ids alanı boş bir dizi olamaz');
    return this.commandBus.execute(new BulkUpdateAdminProductsCommand(body.ids, body.updates));
  }

  @Put(':id') updateProduct(@Param('id') id: string, @Body() data: Record<string, unknown>) { return this.commandBus.execute(new UpdateAdminProductCommand(id, data)); }
}
