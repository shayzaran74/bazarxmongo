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
import { DeleteAdminProductCommand } from '../application/commands/delete-admin-product.command';
import { BulkDeleteAdminProductsCommand } from '../application/commands/bulk-delete-admin-products.command';
import { BulkUpdateAdminProductsCommand } from '../application/commands/bulk-update-admin-products.command';
import { UpdateAdminProductCommand } from '../application/commands/update-admin-product.command';
import { CreateAdminProductCommand } from '../application/commands/create-admin-product.command';
import { QueueImportProductsCommand } from '../application/commands/queue-import-products.command';

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
    private readonly prisma: PrismaService,
  ) {}

  // ─── Stats ─────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get product statistics' })
  @Get('stats')
  async getStats() {
    const [total, active, pending] = await Promise.all([
      this.prisma.catalogProduct.count(),
      this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.listing.count({ where: { status: 'PENDING' } }),
    ]);
    return { success: true, data: { total, active, pending } };
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
  async bulkImport(@Body('rows') rows: any[], @CurrentUser() user: any) {
    if (!Array.isArray(rows)) {
      throw new BadRequestException('rows alanı bir dizi olmalıdır');
    }

    this.logger.log(`Bulk import isteği: ${rows.length} satır — admin: ${user.id}`);

    return this.commandBus.execute(
      new QueueImportProductsCommand(rows, user.id),
    );
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
    @CurrentUser() user: any,
  ) {
    const job = await this.prisma.importJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        totalRows: true,
        processedRows: true,
        createdRows: true,
        failedRows: true,
        errors: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        adminId: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Import job bulunamadı');
    }

    // Güvenlik: admin sadece kendi job'larını görebilir
    if (job.adminId !== user.id) {
      throw new NotFoundException('Import job bulunamadı');
    }

    const progressPercent =
      job.totalRows > 0
        ? Math.round((job.processedRows / job.totalRows) * 100)
        : 0;

    // Geçen süre (saniye)
    const elapsedSeconds = job.startedAt
      ? Math.round(
          ((job.completedAt ?? new Date()).getTime() - job.startedAt.getTime()) / 1000,
        )
      : null;

    return {
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        progress: {
          percent: progressPercent,
          processed: job.processedRows,
          total: job.totalRows,
          created: job.createdRows,
          failed: job.failedRows,
        },
        errors: job.errors ?? [],
        timing: {
          startedAt: job.startedAt,
          completedAt: job.completedAt,
          elapsedSeconds,
        },
        // Frontend polling'i ne zaman durdurmalı:
        isDone: job.status === 'COMPLETED' || job.status === 'FAILED',
      },
    };
  }

  // ─── Admin'in import geçmişi ────────────────────────────────────────────────

  @ApiOperation({ summary: 'List import jobs for current admin' })
  @Get('import-jobs')
  async listImportJobs(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      this.prisma.importJob.findMany({
        where: { adminId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        select: {
          id: true,
          status: true,
          totalRows: true,
          processedRows: true,
          createdRows: true,
          failedRows: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      this.prisma.importJob.count({ where: { adminId: user.id } }),
    ]);

    return {
      success: true,
      data: jobs,
      pagination: { total, page: Number(page), limit: Number(limit) },
    };
  }

  // ─── Mevcut endpoint'ler ────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create a single product' })
  @Post()
  async createProduct(@Body() data: any, @CurrentUser() user: any) {
    try {
      return await this.commandBus.execute(
        new CreateAdminProductCommand(data, user.id),
      );
    } catch (error: any) {
      return { success: false, error: 'Ekleme sırasında hata: ' + error.message };
    }
  }

  @ApiOperation({ summary: 'List all products for admin' })
  @Get()
  async getProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('q') search?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.queryBus.execute(
      new ListAdminProductsQuery({ search, status, page: Number(page) || 1, limit: Number(limit) || 50 }),
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
    try {
      return await this.commandBus.execute(new DeleteAdminProductCommand(id));
    } catch (error: any) {
      return { success: false, error: 'Sipariş geçmişine sahip olabilir, pasife alın.' };
    }
  }

  @ApiOperation({ summary: 'Bulk delete products' })
  @Post('bulk-delete')
  async bulkDelete(@Body('ids') ids: string[]) {
    try {
      return await this.commandBus.execute(new BulkDeleteAdminProductsCommand(ids));
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @ApiOperation({ summary: 'Bulk update products' })
  @Put('bulk-update')
  async bulkUpdate(@Body() body: { ids: string[]; updates: any }) {
    try {
      return await this.commandBus.execute(
        new BulkUpdateAdminProductsCommand(body.ids, body.updates),
      );
    } catch (error: any) {
      return { success: false, error: 'Toplu güncelleme sırasında hata: ' + error.message };
    }
  }

  @ApiOperation({ summary: 'Update a product' })
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.commandBus.execute(new UpdateAdminProductCommand(id, data));
    } catch (error: any) {
      return { success: false, error: 'Güncelleme sırasında hata: ' + error.message };
    }
  }
}
