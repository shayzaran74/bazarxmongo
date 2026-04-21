import { Injectable, Logger } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';

@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);

  async generate(invoice: Invoice, orderData: {
    buyerEmail: string;
    buyerName: string;
    vendorName: string;
    vendorTaxNumber?: string;
  }): Promise<Buffer> {
    // PDFKit dinamik import (ESM/CJS uyumu için)
    let PDFDocument: any;
    try {
      PDFDocument = (await import('pdfkit')).default;
    } catch (e) {
      this.logger.error('pdfkit is not installed. Please run: pnpm add pdfkit');
      throw new Error('PDF Generation failed: pdfkit missing');
    }
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const props = invoice.getProps();

      // --- Header ---
      doc.fontSize(20).text('FATURA', { align: 'center' });
      doc.moveDown();

      // --- Invoice Info ---
      doc.fontSize(10);
      doc.text(`Fatura No: ${invoice.invoiceNumber}`);
      doc.text(`Tarih: ${props.issuedAt.toLocaleDateString('tr-TR')}`);
      doc.text(`Tür: ${props.type === 'BUYER_INVOICE' ? 'Alıcı Faturası' : 'Satıcı Faturası'}`);
      doc.text(`Durum: ${props.status}`);
      doc.moveDown();

      // --- Parties ---
      doc.fontSize(12).text('Satıcı Bilgileri:', { underline: true });
      doc.fontSize(10);
      doc.text(`Ad: ${orderData.vendorName}`);
      if (orderData.vendorTaxNumber) {
        doc.text(`Vergi No: ${orderData.vendorTaxNumber}`);
      }
      doc.moveDown();

      doc.fontSize(12).text('Alıcı Bilgileri:', { underline: true });
      doc.fontSize(10);
      doc.text(`Ad: ${orderData.buyerName}`);
      doc.text(`E-posta: ${orderData.buyerEmail}`);
      doc.moveDown();

      // --- Items Table ---
      doc.fontSize(12).text('Ürünler:', { underline: true });
      doc.moveDown(0.5);

      // Table header
      doc.fontSize(9);
      const tableTop = doc.y;
      doc.text('Açıklama', 50, tableTop);
      doc.text('Adet', 300, tableTop);
      doc.text('Birim Fiyat', 360, tableTop);
      doc.text('Toplam', 450, tableTop);
      doc.moveDown();

      // Separator line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Items
      for (const item of props.items) {
        const y = doc.y;
        doc.text(item.description, 50, y);
        doc.text(String(item.quantity), 300, y);
        doc.text(`${Number(item.unitPrice).toFixed(2)} TRY`, 360, y);
        doc.text(`${Number(item.totalPrice).toFixed(2)} TRY`, 450, y);
        doc.moveDown();
      }

      // Separator line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // --- Totals ---
      doc.fontSize(10);
      doc.text(`Ara Toplam: ${Number(props.subtotal).toFixed(2)} TRY`, { align: 'right' });
      doc.text(`KDV: ${Number(props.taxAmount).toFixed(2)} TRY`, { align: 'right' });
      doc.fontSize(12).text(
        `GENEL TOPLAM: ${Number(props.totalAmount).toFixed(2)} ${props.currency}`,
        { align: 'right' }
      );

      doc.moveDown(2);
      doc.fontSize(8).text(
        'Bu fatura BarterBorsa platformu üzerinden otomatik olarak oluşturulmuştur.',
        { align: 'center', color: 'grey' }
      );

      doc.end();
    });
  }
}
