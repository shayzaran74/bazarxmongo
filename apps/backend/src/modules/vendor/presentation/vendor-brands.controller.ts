// apps/backend/src/modules/vendor/presentation/vendor-brands.controller.ts

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, NotFoundException,
  UseInterceptors, UploadedFile, BadRequestException,
  HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
  ApiParam, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IMediaService, MEDIA_SERVICE } from '../../media/domain/media.service.interface';

const fileInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp',
                     'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`Desteklenmeyen format: ${file.mimetype}`), false);
    }
  },
});

@ApiTags('Vendor Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendor-brands')
export class VendorBrandsController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MEDIA_SERVICE) private readonly mediaService: IMediaService,
  ) {}

  @ApiOperation({ summary: "Satıcının marka başvurularını listele" })
  @Get()
  async findAll(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) return { success: true, data: [] };

    const data = await this.prisma.brand.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Marka başvurusu yap' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name:        { type: 'string', example: 'Marka Adı' },
        description: { type: 'string' },
        aliases:     { type: 'array', items: { type: 'string' } },
      },
      required: ['name'],
    },
  })
  @Post('apply')
  async apply(@CurrentUser() user: any, @Body() body: any) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    // Aynı isimde marka var mı?
    const existing = await this.prisma.brand.findUnique({
      where: { name: body.name },
    });
    if (existing) throw new BadRequestException('Bu marka adı zaten mevcut');

    const slug = body.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const brand = await this.prisma.brand.create({
      data: {
        name:        body.name,
        slug:        `${slug}-${Date.now()}`, // benzersizlik için
        description: body.description,
        aliases:     body.aliases ?? [],
        vendorId:    vendor.id,
        status:      'PENDING',
        submittedAt: new Date(),
      },
    });
    return { success: true, data: brand };
  }

  @ApiOperation({ summary: 'Marka logosu yükle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, brandId: { type: 'string' } } } })
  @Post('upload-logo')
  @UseInterceptors(fileInterceptor)
  async uploadLogo(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('brandId') brandId: string,
  ) {
    if (!file) throw new BadRequestException('Dosya yüklenmedi');

    const result = await this.mediaService.processAndUpload(file, {
      subPath: 'brand-logos',
    });
    if (!result.success) throw new BadRequestException(result.error.message);

    // brandId verilmişse brand kaydına logo URL'ini ekle
    if (brandId) {
      await this.prisma.brand.updateMany({
        where: { id: brandId, vendorId: await this.getVendorId(user.id) },
        data: { image: result.data.url },
      });
    }

    return { success: true, url: result.data.url, data: result.data };
  }

  @ApiOperation({ summary: 'Marka dokümanı yükle (PDF/görsel)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @Post('upload-document')
  @UseInterceptors(fileInterceptor)
  async uploadDocument(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Dosya yüklenmedi');

    const result = await this.mediaService.processAndUpload(file, {
      subPath: 'brand-documents',
    });
    if (!result.success) throw new BadRequestException(result.error.message);

    return { success: true, url: result.data.url, data: result.data };
  }

  @ApiOperation({ summary: 'Marka bilgisi güncelle' })
  @ApiParam({ name: 'id' })
  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const vendorId = await this.getVendorId(user.id);
    const brand = await this.prisma.brand.findFirst({
      where: { id, vendorId },
    });
    if (!brand) throw new NotFoundException('Marka bulunamadı');

    const updated = await this.prisma.brand.update({
      where: { id },
      data: {
        ...(body.description !== undefined && { description: body.description }),
        ...(body.aliases     !== undefined && { aliases: body.aliases }),
      },
    });
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: 'Marka başvurusunu geri çek' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const vendorId = await this.getVendorId(user.id);
    const brand = await this.prisma.brand.findFirst({
      where: { id, vendorId, status: 'PENDING' },
    });
    if (!brand) throw new NotFoundException('Silinebilir başvuru bulunamadı');

    await this.prisma.brand.delete({ where: { id } });
    return { success: true };
  }

  private async getVendorId(userId: string): Promise<string> {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');
    return vendor.id;
  }
}
