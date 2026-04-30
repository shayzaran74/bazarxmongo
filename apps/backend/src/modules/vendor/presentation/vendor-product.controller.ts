// apps/backend/src/modules/vendor/presentation/vendor-product.controller.ts

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
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
import { BulkImportVendorProductsCommand } from '../application/commands/bulk-import-vendor-products.command';
import { FileParserService } from '../application/services/file-parser.service';

interface AuthenticatedUser {
  id: string;
  role: string;
}

const ACCEPTED_MIME = [
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
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
    private readonly fileParser: FileParserService,
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
          /\.(xlsx|xls|csv)$/i.test(file.originalname)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Sadece Excel (.xlsx/.xls) ve CSV dosyaları kabul edilir',
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
    if (!file) throw new BadRequestException('Lütfen bir dosya yükleyin.');

    // Vendor doğrulama (controller sorumluluğu: istek sahibinin kimliği)
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) throw new BadRequestException('Satıcı hesabı bulunamadı');

    // Dosya parse (controller sorumluluğu: ham dosyadan yapılandırılmış veriye)
    const isCSV = /\.csv$/i.test(file.originalname) || file.mimetype === 'text/csv';
    const rows = isCSV
      ? this.fileParser.parseCSV(file.buffer.toString('utf-8'))
      : await this.fileParser.parseExcel(file.buffer);

    if (rows.length === 0) {
      throw new BadRequestException('Dosyada işlenebilir satır bulunamadı');
    }
    if (rows.length > MAX_ROWS) {
      throw new BadRequestException(
        `Maksimum ${MAX_ROWS.toLocaleString('tr-TR')} satır yüklenebilir (gönderilen: ${rows.length})`,
      );
    }

    // İş mantığı tamamen handler'a delege edildi
    return this.commandBus.execute(
      new BulkImportVendorProductsCommand(vendor.id, rows),
    );
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

  @ApiOperation({ summary: 'Yeni ürün/listing oluştur' })
  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    return this.commandBus.execute(new CreateVendorProductCommand(user.id, body));
  }

  @ApiOperation({ summary: 'Ürün güncelle' })
  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.commandBus.execute(new UpdateVendorProductCommand(user.id, id, body));
  }

  @ApiOperation({ summary: 'Ürün sil' })
  @Delete(':id')
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteVendorProductCommand(user.id, id));
  }
}
