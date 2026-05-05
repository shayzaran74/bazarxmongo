// apps/backend/src/modules/catalog/presentation/product-admin.controller.ts

import {
  Controller, Get, Query, UseGuards,
  Delete, Param, Post, Body, Put,
  BadRequestException, Logger, NotFoundException,
} from '@nestjs/common';
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
  async bulkImport(@Body('rows') rows: unknown[], @CurrentUser() user: AuthenticatedUser) {
    if (!Array.isArray(rows)) {
      throw new BadRequestException('rows alanı bir dizi olmalıdır');
    }
    this.logger.log(`Bulk import isteği: ${rows.length} satır — admin: ${user.id}`);
    return this.commandBus.execute(new QueueImportProductsCommand(rows, user.id));
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
  ) {
    const result = await this.queryBus.execute(
      new ListAdminProductsQuery({
        search,
        status,
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
