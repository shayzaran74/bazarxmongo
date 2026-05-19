// apps/backend/src/modules/commerce/presentation/einvoice.controller.ts

import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { EInvoiceGeneratorService } from '../application/services/einvoice-generator.service';

@Controller('vendors/me/invoices')
@UseGuards(JwtAuthGuard)
export class EInvoiceController {
  constructor(private readonly einvoiceGenerator: EInvoiceGeneratorService) {}

  /**
   * GET /vendors/me/invoices
   * Satıcının e-faturalarını listele
   */
  @Get()
  async listInvoices(@Request() req: any) {
    return { success: true, data: { items: [], total: 0 } };
  }

  /**
   * GET /vendors/me/invoices/:id/download/xml
   * e-Fatura XML indir
   */
  @Get(':id/download/xml')
  async downloadXml(@Param('id') id: string, @Request() req: any) {
    // TODO: MinIO'dan XML indirme URL'i üret
    return { success: true, data: { downloadUrl: null } };
  }
}

@Controller('orders/:id/einvoice')
@UseGuards(JwtAuthGuard)
export class OrderEInvoiceController {
  constructor(private readonly einvoiceGenerator: EInvoiceGeneratorService) {}

  /**
   * GET /orders/:id/einvoice
   * Siparişin e-fatura bilgilerini getir
   */
  @Get()
  async getOrderEInvoice(@Param('id') orderId: string, @Request() req: any) {
    const einvoice = await this.einvoiceGenerator.getEInvoice(orderId);
    return { success: true, data: einvoice };
  }
}

@Controller('admin/einvoices')
@UseGuards(JwtAuthGuard)
export class AdminEInvoiceController {
  constructor(private readonly einvoiceGenerator: EInvoiceGeneratorService) {}

  /**
   * GET /admin/einvoices
   * Tüm e-faturaları listele (admin)
   */
  @Get()
  async listAll(@Request() req: any) {
    return { success: true, data: { items: [], total: 0 } };
  }

  /**
   * POST /admin/einvoices/:id/resend
   * e-Faturayı yeniden GİB'e gönder
   */
  @Post(':id/resend')
  @HttpCode(HttpStatus.OK)
  async resendEInvoice(@Param('id') id: string, @Request() req: any) {
    await this.einvoiceGenerator.resendEInvoice(id);
    return { success: true };
  }
}