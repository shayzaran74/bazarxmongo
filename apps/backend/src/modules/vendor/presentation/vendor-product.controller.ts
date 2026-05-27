// apps/backend/src/modules/vendor/presentation/vendor-product.controller.ts

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Res,
  BadRequestException, UseInterceptors, UploadedFile, Inject, Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { IVendor } from '@barterborsa/shared-persistence';
import { Vendor as VendorModel } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

import { UpdateVendorProductCommand } from '../application/commands/update-vendor-product.command';
import { DeleteVendorProductCommand } from '../application/commands/delete-vendor-product.command';
import { ListVendorProductsQuery } from '../application/queries/list-vendor-products.query';
import { BulkImportVendorProductsCommand } from '../application/commands/bulk-import-vendor-products.command';
import { FileParserService } from '../application/services/file-parser.service';
import { ImportTemplateService } from '../application/services/import-template.service';
import { IVendorRepository } from '../domain/repositories/vendor.repository.interface';
import { ITierBenefit, TierBenefit } from '@barterborsa/shared-persistence';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
}

const ACCEPTED_MIME = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
  'application/json',
  'text/plain',
];
const DEFAULT_EXCEL_BATCH_LIMIT = 50;

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
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly fileParser: FileParserService,
    @InjectModel('TierBenefit') private readonly tierModel: Model<ITierBenefit>,
    private readonly templateService: ImportTemplateService,
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (
          ACCEPTED_MIME.includes(file.mimetype) ||
          /\.(xlsx|xls|csv|json)$/i.test(file.originalname)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Sadece Excel (.xlsx/.xls), CSV ve JSON dosyaları kabul edilir',
            ),
            false,
          );
        }
      },
    }),
  )
  async bulkImport(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(`[bulkImport] Başladı — userId: ${user.id}, dosya: ${file?.originalname}, boyut: ${file?.size}`);

    if (!file) throw new BadRequestException('Lütfen bir dosya yükleyin.');

    const vendorDoc = await VendorModel.findOne({ userId: user.id }).lean().exec() as IVendor | null;
    if (!vendorDoc) throw new BadRequestException('Satıcı hesabı bulunamadı');

    const vendorId = vendorDoc.id;
    const vendorTier = vendorDoc.tier;

    // Tier benefit excelBatchLimit zorlaması
    const tierBenefit = await this.tierModel.findOne({ tier: vendorTier ?? 'CORE' }).lean<ITierBenefit>().exec();
    const excelBatchLimit = tierBenefit?.excelBatchLimit ?? DEFAULT_EXCEL_BATCH_LIMIT;

    const isCSV  = /\.csv$/i.test(file.originalname)  || file.mimetype === 'text/csv';
    const isJSON = /\.json$/i.test(file.originalname) || file.mimetype === 'application/json';
    this.logger.log(`[bulkImport] Dosya tipi: ${isCSV ? 'CSV' : isJSON ? 'JSON' : 'Excel'}, vendorId: ${vendorId}, tier: ${vendorTier}, excelBatchLimit: ${excelBatchLimit}`);
    const rows = isJSON
      ? this.fileParser.parseJSON(file.buffer.toString('utf-8'))
      : isCSV
        ? this.fileParser.parseCSV(file.buffer.toString('utf-8'))
        : await this.fileParser.parseExcel(file.buffer);
    this.logger.log(`[bulkImport] Parse edilen satır sayısı: ${rows.length}`);

    if (rows.length === 0) {
      throw new BadRequestException('Dosyada işlenebilir satır bulunamadı');
    }
    if (rows.length > excelBatchLimit) {
      throw new BadRequestException(
        `${vendorTier ?? 'CORE'} paketi için Excel batch limiti ${excelBatchLimit.toLocaleString('tr-TR')} satırdır (gönderilen: ${rows.length}). Lütfen paketinizi yükseltin veya dosyayı parçalara ayırın.`,
      );
    }

    this.logger.log(`[bulkImport] Command dispatch — vendorId: ${vendorId}, satır: ${rows.length}`);
    const result = await this.commandBus.execute(
      new BulkImportVendorProductsCommand(vendorId, rows),
    );
    this.logger.log(`[bulkImport] Tamamlandı — sonuç: ${JSON.stringify(result)}`);
    return result;
  }

  @ApiOperation({ summary: 'Satıcının ürünlerini listele' })
  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
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

  @ApiOperation({ summary: 'Ürün güncelle' })
  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    return this.commandBus.execute(new UpdateVendorProductCommand(user.id, id, body));
  }

  @ApiOperation({ summary: 'Ürün sil' })
  @Delete(':id')
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteVendorProductCommand(user.id, id));
  }

  @ApiOperation({ summary: 'İndirilebilir ürün şablonu dosyası üret' })
  @Get('templates/:type')
  @UseGuards(JwtAuthGuard)
  async downloadTemplate(
    @Param('type') type: string,
    @Res() res: Response,
  ) {
    if (type === 'vendor-excel') {
      const buffer = this.templateService.generateVendorExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="vendor_urun_sablonu.xlsx"');
      res.status(200).end(buffer);
    } else if (type === 'admin-excel') {
      const buffer = this.templateService.generateAdminExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="admin_urun_sablonu.xlsx"');
      res.status(200).end(buffer);
    } else if (type === 'trendyol-json') {
      const json = this.templateService.generateTrendyolJson();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="trendyol_import_sablonu.json"');
      res.status(200).end(json);
    } else {
      throw new BadRequestException('Geçersiz şablon tipi. Kabul edilenler: vendor-excel, admin-excel, trendyol-json');
    }
  }
}