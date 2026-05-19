// apps/backend/src/modules/commerce/domain/interfaces/IEInvoiceProvider.interface.ts

import { EInvoiceStatus } from '../enums/einvoice-status.enum';

export interface EInvoiceXmlResult {
  invoiceId: string;
  einvoiceNumber?: string;
  xmlContent: string;
  status: EInvoiceStatus;
}

export interface EInvoiceSignResult {
  signedXml: string;
  signature: string;
  signedAt: Date;
}

export interface EInvoiceSendResult {
  gibReceiptDate?: Date;
  gibStatus: string;
  einvoiceNumber: string;
}

export interface IEInvoiceProvider {
  readonly providerName: string;

  /**
   * Fatura XML oluştur (GİB UBL 2.1 formatında)
   */
  generateXml(invoiceData: any): Promise<EInvoiceXmlResult>;

  /**
   * XML'e dijital imza ekle
   */
  signXml(xmlContent: string, certificateData: string): Promise<EInvoiceSignResult>;

  /**
   * GİB'e gönder
   */
  sendToGib(signedXml: string, recipientId: string): Promise<EInvoiceSendResult>;

  /**
   * GİB yanıtını kontrol et
   */
  checkGibStatus(einvoiceNumber: string): Promise<{ status: EInvoiceStatus; receiptDate?: Date }>;

  /**
   * Faturayı iptal et
   */
  cancelEInvoice(einvoiceNumber: string, reason: string): Promise<void>;
}