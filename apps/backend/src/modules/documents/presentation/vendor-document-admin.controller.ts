// apps/backend/src/modules/documents/presentation/vendor-document-admin.controller.ts

import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { DocumentService } from '../application/services/document.service';

@ApiTags('Vendor Documents Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/vendors')
export class VendorDocumentAdminController {
  constructor(private readonly documentService: DocumentService) {}

  @Get(':vendorId/documents')
  @ApiOperation({ summary: 'Satıcının tüm belgelerini listele (Admin)' })
  async listVendorDocuments(@Param('vendorId') vendorId: string) {
    const documents = await this.documentService.listDocuments(vendorId);
    return { success: true, data: documents };
  }

  @Get('documents/:id/url')
  @ApiOperation({ summary: 'Belge indirme/görüntüleme için 15 dakikalık geçici imzalı URL (presigned) üret (Admin)' })
  async getUrl(@Param('id') id: string) {
    // Admin erişimi için requestingVendorId = undefined, isAdmin = true, ttl = 900 (15 dakika)
    const url = await this.documentService.getSignedUrl(id, undefined, true, 900);
    return { success: true, data: { url } };
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Satıcı belgesini sil (Admin)' })
  async delete(@Param('id') id: string) {
    // Admin erişimi için requestingVendorId = undefined, isAdmin = true
    await this.documentService.deleteDocument(id, undefined, true);
    return { success: true };
  }
}
