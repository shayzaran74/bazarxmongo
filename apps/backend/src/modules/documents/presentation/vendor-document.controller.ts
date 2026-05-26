// apps/backend/src/modules/documents/presentation/vendor-document.controller.ts

import {
  Controller, Get, Post, Delete, Param,
  UploadedFile, UseInterceptors, UseGuards, Inject,
  ForbiddenException, NotFoundException, Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { DocumentService } from '../application/services/document.service';
import { DocumentType } from '../domain/enums/document-type.enum';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';

@ApiTags('Vendor Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendors/me/documents')
export class VendorDocumentController {
  constructor(
    private readonly documentService: DocumentService,
    @Inject('IVendorRepository')
    private readonly vendorRepo: IVendorRepository,
  ) {}

  /**
   * Giriş yapmış kullanıcının (User) satıcı (Vendor) ID'sini bulur.
   */
  private async getVendorIdOrThrow(userId: string): Promise<string> {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) {
      throw new ForbiddenException('Bu işlem için aktif bir satıcı hesabınızın olması gerekir.');
    }
    return vendor.id;
  }

  @Post()
  @ApiOperation({ summary: 'Satıcı belgesi yükle (Private Bucket)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        documentType: { type: 'string', enum: Object.values(DocumentType), example: DocumentType.INVOICE }
      },
      required: ['file', 'documentType']
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: DocumentType,
  ) {
    const vendorId = await this.getVendorIdOrThrow(user.id);
    if (!file) {
      throw new NotFoundException('Yüklenecek dosya seçilmedi');
    }
    const document = await this.documentService.uploadDocument(vendorId, file, documentType, user.id);
    return { success: true, data: document };
  }

  @Get()
  @ApiOperation({ summary: 'Satıcı belgelerini listele' })
  async list(@CurrentUser() user: any) {
    const vendorId = await this.getVendorIdOrThrow(user.id);
    const documents = await this.documentService.listDocuments(vendorId);
    return { success: true, data: documents };
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Belge indirme/görüntüleme için geçici imzalı URL (presigned) üret' })
  async getUrl(@CurrentUser() user: any, @Param('id') id: string) {
    const vendorId = await this.getVendorIdOrThrow(user.id);
    const url = await this.documentService.getSignedUrl(id, vendorId);
    return { success: true, data: { url } };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Satıcı belgesini sil' })
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    const vendorId = await this.getVendorIdOrThrow(user.id);
    await this.documentService.deleteDocument(id, vendorId);
    return { success: true };
  }
}
