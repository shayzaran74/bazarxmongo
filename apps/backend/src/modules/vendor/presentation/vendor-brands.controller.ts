// apps/backend/src/modules/vendor/presentation/vendor-brands.controller.ts

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, NotFoundException,
  UseInterceptors, UploadedFile, BadRequestException,
  HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiParam, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { IMediaService, MEDIA_SERVICE } from '../../media/domain/media.service.interface';
import { ListVendorBrandsQuery } from '../application/queries/list-vendor-brands.query';
import { ApplyBrandCommand } from '../application/commands/apply-brand.command';
import { UpdateBrandCommand } from '../application/commands/update-brand.command';
import { DeleteBrandCommand } from '../application/commands/delete-brand.command';
import { IVendorRepository } from '../domain/repositories/vendor.repository.interface';
import { MongoBrandRepository } from '../infrastructure/persistence/mongo-brand.repository';

interface AuthenticatedUser {
  id: string;
  role: string;
}

const fileInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`Desteklenmeyen format: ${file.mimetype}`), false);
    }
  },
});

@ApiTags('Vendor Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
@Controller('vendor-brands')
export class VendorBrandsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly brandRepo: MongoBrandRepository,
    @Inject(MEDIA_SERVICE) private readonly mediaService: IMediaService,
  ) {}

  @ApiOperation({ summary: "Satıcının marka başvurularını listele" })
  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new ListVendorBrandsQuery(user.id));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Marka başvurusu yap' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name:             { type: 'string', example: 'Marka Adı' },
        description:      { type: 'string' },
        aliases:          { type: 'array', items: { type: 'string' } },
        documentUrl:      { type: 'string' },
        invoiceChainUrl:  { type: 'string' },
        authorizationUrl: { type: 'string' },
        image:            { type: 'string' },
      },
      required: ['name'],
    },
  })
  @Post('apply')
  async apply(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { 
      name: string; 
      description?: string; 
      aliases?: string[]; 
      documentUrl?: string; 
      invoiceChainUrl?: string; 
      authorizationUrl?: string; 
      image?: string; 
    },
  ) {
    if (!body.name?.trim()) {
      throw new BadRequestException('Marka adı zorunludur');
    }
    return this.commandBus.execute(
      new ApplyBrandCommand(user.id, {
        name: body.name.trim(),
        description: body.description,
        aliases: body.aliases,
        documentUrl: body.documentUrl,
        invoiceChainUrl: body.invoiceChainUrl,
        authorizationUrl: body.authorizationUrl,
        image: body.image,
      } as any),
    );
  }

  @ApiOperation({ summary: 'Marka logosu yükle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file:    { type: 'string', format: 'binary' },
        brandId: { type: 'string' },
      },
    },
  })
  @Post('upload-logo')
  @UseInterceptors(fileInterceptor)
  async uploadLogo(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('brandId') brandId: string,
  ) {
    if (!file) throw new BadRequestException('Dosya yüklenmedi');

    const result = await this.mediaService.processAndUpload(file, { subPath: 'brand-logos' });
    if (!result.success) throw new BadRequestException(result.error.message);

    if (brandId) {
      const vendor = await this.vendorRepo.findByUserId(user.id);
      if (vendor) {
        const vendorProps = vendor.getProps();
        const vendorId = (vendorProps as any).id || vendor.id;
        await this.brandRepo.update(brandId, { image: result.data.url });
      }
    }

    return { success: true, url: result.data.url, data: result.data };
  }

  @ApiOperation({ summary: 'Marka dokümanı yükle (PDF/görsel)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file:    { type: 'string', format: 'binary' },
        brandId: { type: 'string', description: 'Dokümanın bağlanacağı marka ID' },
      },
      required: ['brandId'],
    },
  })
  @Post('upload-document')
  @UseInterceptors(fileInterceptor)
  async uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('brandId') brandId: string,
  ) {
    if (!file) throw new BadRequestException('Dosya yüklenmedi');
    if (!brandId) throw new BadRequestException('brandId zorunludur');

    const vendor = await this.vendorRepo.findByUserId(user.id);
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const vendorProps = vendor.getProps();
    const vendorId = (vendorProps as any).id || vendor.id;

    const brand = await this.brandRepo.findById(brandId);
    if (!brand || (brand as any).vendorId !== vendorId) throw new NotFoundException('Marka bulunamadı');

    const result = await this.mediaService.processAndUpload(file, { subPath: 'brand-documents' });
    if (!result.success) throw new BadRequestException(result.error.message);

    await this.brandRepo.update(brandId, { documentUrl: result.data.url });

    return { success: true, url: result.data.url, data: result.data };
  }

  @ApiOperation({ summary: 'Marka bilgisi güncelle' })
  @ApiParam({ name: 'id' })
  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { description?: string; aliases?: string[] },
  ) {
    return this.commandBus.execute(
      new UpdateBrandCommand(user.id, id, {
        description: body.description,
        aliases: body.aliases,
      }),
    );
  }

  @ApiOperation({ summary: 'Marka başvurusunu geri çek' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteBrandCommand(user.id, id));
  }
}