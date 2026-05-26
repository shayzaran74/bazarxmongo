// apps/backend/src/modules/catalog/presentation/product-admin.controller.ts

import {
  Controller, Get, Query, UseGuards,
  Delete, Param, Post, Body, Put,
  BadRequestException, Logger,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsObject, IsBoolean, IsIn, Min, MaxLength } from 'class-validator';
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
import { TrendyolImportNormalizerService } from '../application/services/trendyol-import-normalizer.service';

interface AuthenticatedUser { id: string; role: string }

class CreateAdminProductDto {
  @IsString() @MaxLength(500) name!: string;
  @IsOptional() @IsString() @MaxLength(500) slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() brandName?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) price?: number;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) stock?: number;
  @IsOptional() @IsString() @IsIn(['ACTIVE', 'INACTIVE', 'DRAFT', 'PENDING']) status?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsObject() specs?: Record<string, string | number | boolean>;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isSpecialOffer?: boolean;
  @IsOptional() @IsBoolean() isFlashSale?: boolean;

  // Formdan veya diğer modüllerden gelebilecek ek alanlar
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() @IsString() gtin?: string;
  @IsOptional() @IsString() modelCode?: string;
  @IsOptional() @IsString() trendyolProductId?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) marketPrice?: number;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) vatRate?: number;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) lowStockThreshold?: number;
  @IsOptional() @IsString() stockCode?: string;
  @IsOptional() @IsBoolean() hasVariants?: boolean;
}

class UpdateAdminProductDto {
  @IsOptional() @IsString() @MaxLength(500) name?: string;
  @IsOptional() @IsString() @MaxLength(500) slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() brandName?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) price?: number;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) stock?: number;
  @IsOptional() @IsString() @IsIn(['ACTIVE', 'INACTIVE', 'DRAFT', 'PENDING']) status?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) productImages?: string[];
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsObject() specs?: Record<string, string | number | boolean>;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isSpecialOffer?: boolean;
  @IsOptional() @IsBoolean() isFlashSale?: boolean;

  // Formdan veya diğer modüllerden gelebilecek ek alanlar
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() @IsString() gtin?: string;
  @IsOptional() @IsString() modelCode?: string;
  @IsOptional() @IsString() trendyolProductId?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) marketPrice?: number;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) vatRate?: number;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) lowStockThreshold?: number;
  @IsOptional() @IsString() stockCode?: string;
  @IsOptional() @IsBoolean() hasVariants?: boolean;
}

class BulkUpdateProductDto {
  @IsArray() @IsString({ each: true }) ids!: string[];
  @IsObject() updates!: UpdateAdminProductDto;
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
    private readonly trendyolNormalizer: TrendyolImportNormalizerService,
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
    const rows = await Promise.all(
      dto.products.map(async p => {
        const normalized = await this.trendyolNormalizer.normalize(p as unknown as Record<string, unknown>);
        const finalStock = normalized.stock > 1 ? normalized.stock : (dto.defaultStock ?? 1);
        const specs = { ...normalized.attributes };
        return {
          name: normalized.name,
          description: normalized.description || normalized.name,
          price: normalized.price,
          stock: finalStock,
          sku: normalized.sku,
          brandName: normalized.brand,
          status: 'ACTIVE',
          productImages: normalized.imageUrls,
          specs,
          categoryId: normalized.categoryId,
        };
      }),
    );
    return this.commandBus.execute(new QueueImportProductsCommand(rows, user.id, dto.vendorType || 'COMMERCE'));
  }

  @Post() createProduct(@Body() data: CreateAdminProductDto, @CurrentUser() user: AuthenticatedUser) { return this.commandBus.execute(new CreateAdminProductCommand(data, user.id)); }

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
  async bulkUpdate(@Body() body: BulkUpdateProductDto) {
    if (!Array.isArray(body.ids) || !body.ids.length) throw new BadRequestException('ids alanı boş bir dizi olamaz');
    return this.commandBus.execute(new BulkUpdateAdminProductsCommand(body.ids, body.updates as Record<string, unknown>));
  }

  @Put(':id') updateProduct(@Param('id') id: string, @Body() data: UpdateAdminProductDto) { return this.commandBus.execute(new UpdateAdminProductCommand(id, data as Record<string, unknown>)); }
}
