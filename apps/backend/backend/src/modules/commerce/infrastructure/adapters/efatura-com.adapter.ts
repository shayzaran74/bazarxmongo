// apps/backend/src/modules/commerce/infrastructure/adapters/efatura-com.adapter.ts
// efatura.com adapter — GİB UBL 2.1 XML oluşturma ve dijital imza (Master Plan §3.7)
// MVP: Sadece bu adapter implement, diğerleri (Logo, Paraşüt) stub olarak kal

import { Injectable, Logger } from '@nestjs/common';
import { IEInvoiceProvider, EInvoiceXmlResult, EInvoiceSignResult, EInvoiceSendResult } from '../../domain/interfaces/IEInvoiceProvider.interface';
import { EInvoiceStatus } from '../../domain/enums/einvoice-status.enum';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface UBLInvoiceData {
  id: string;
  issueDate: string;
  issueTime?: string;
  invoiceTypeCode: 'SATIS' | 'IADE' | 'TEMEL';
  profileID?: string;
  supplierName: string;
  supplierTaxId: string;
  supplierPartyIdentification: string;
  supplierStreetName: string;
  supplierBuildingNumber: string;
  supplierCityName: string;
  supplierDistrict: string;
  supplierCountry: string;
  supplierContact: string;
  supplierPhone: string;
  supplierEmail: string;
  customerName: string;
  customerTaxId: string;
  customerPartyIdentification: string;
  customerStreetName: string;
  customerBuildingNumber: string;
  customerCityName: string;
  customerDistrict: string;
  customerCountry: string;
  lines: UBLInvoiceLine[];
  currencyCode: string;
  taxAmount: number;
  payableAmount: number;
  paymentMeansCode?: string;
  paymentDueDate?: string;
  orderReference?: string;
  recipientId?: string;
}

export interface UBLInvoiceLine {
  id: number;
  description: string;
  quantity: number;
  unitCode: string;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineExtensionAmount: number;
  itemName: string;
  hsnCode?: string;
}

@Injectable()
export class EfaturaComAdapter implements IEInvoiceProvider {
  private readonly logger = new Logger(EfaturaComAdapter.name);
  readonly providerName = 'EFATURA_COM';

  private readonly GIB_API_URL = process.env.GIB_API_URL || 'https://efatura.gib.gov.tr';
  private readonly GIB_USER = process.env.GIB_API_USER || '';
  private readonly GIB_PASSWORD = process.env.GIB_API_PASSWORD || '';
  private readonly CERT_DATA = process.env.EINVOICE_CERTIFICATE_DATA || '';
  private readonly SAVE_TO_MINIO = process.env.EINVOICE_SAVE_TO_MINIO === 'true';

  constructor(private readonly httpService: HttpService) {}

  async generateXml(invoiceData: UBLInvoiceData): Promise<EInvoiceXmlResult> {
    const data = invoiceData as UBLInvoiceData;
    this.logger.log('e-Fatura XML oluşturuluyor', { invoiceId: data.id });

    const linesXml = data.lines.map(line => this.buildLineXml(line)).join('\n');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:cac:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:cbc:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:dsig:xsd:envelopedsignature0">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>${data.profileID || 'TICARIFATURA'}</cbc:ProfileID>
  <cbc:ID>${this.xmlEscape(data.id)}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:IssueDate>${data.issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${data.issueTime || '00:00:00'}</cbc:IssueTime>
  <cbc:InvoiceTypeCode listAgencyID="URI" listID="urn:oasis:names:specification:ubl:codelist:gc:InvoiceTypeCode">${data.invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:Note>${this.xmlEscape(data.currencyCode + ' ' + data.payableAmount.toFixed(2))}</cbc:Note>
  <cbc:DocumentCurrencyCode>${data.currencyCode}</cbc:DocumentCurrencyCode>
  <cbc:BuyerCustomerParty>${this.buildCustomerParty(data)}</cbc:BuyerCustomerParty>
  <cac:AccountingSupplierParty>${this.buildSupplierParty(data)}</cac:AccountingSupplierParty>
  <cac:PaymentMeans>${this.buildPaymentMeans(data)}</cac:PaymentMeans>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${data.currencyCode}">${data.taxAmount.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${data.currencyCode}">${(data.payableAmount - data.taxAmount).toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${data.currencyCode}">${(data.payableAmount - data.taxAmount).toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${data.currencyCode}">${data.payableAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${data.currencyCode}">${data.payableAmount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
${linesXml}
</Invoice>`;

    return {
      invoiceId: data.id,
      xmlContent,
      status: EInvoiceStatus.XML_GENERATED,
    };
  }

  private buildSupplierParty(data: UBLInvoiceData): string {
    return `
    <cac:Party>
      <cbc:WebsiteURI>https://bazarx.com.tr</cbc:WebsiteURI>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${data.supplierTaxId}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyIdentification>
        <cbc:ID schemeID="TICARISICILNO">${data.supplierPartyIdentification}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${this.xmlEscape(data.supplierName)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${this.xmlEscape(data.supplierStreetName)}</cbc:StreetName>
        <cbc:BuildingNumber>${this.xmlEscape(data.supplierBuildingNumber)}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${this.xmlEscape(data.supplierDistrict)}</cbc:CitySubdivisionName>
        <cbc:CityName>${this.xmlEscape(data.supplierCityName)}</cbc:CityName>
        <cac:Country>
          <cbc:Name>${data.supplierCountry}</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:Contact>
        <cbc:Name>${this.xmlEscape(data.supplierContact)}</cbc:Name>
        <cbc:Telephone>${this.xmlEscape(data.supplierPhone)}</cbc:Telephone>
        <cbc:ElectronicMail>${this.xmlEscape(data.supplierEmail)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>`;
  }

  private buildCustomerParty(data: UBLInvoiceData): string {
    return `
    <cac:CustomerParty>
      <cac:Party>
        <cac:PartyIdentification>
          <cbc:ID schemeID="VKN">${data.customerTaxId}</cbc:ID>
        </cac:PartyIdentification>
        <cac:PartyIdentification>
          <cbc:ID schemeID="TICARISICILNO">${data.customerPartyIdentification}</cbc:ID>
        </cac:PartyIdentification>
        <cac:PartyName>
          <cbc:Name>${this.xmlEscape(data.customerName)}</cbc:Name>
        </cac:PartyName>
        <cac:PostalAddress>
          <cbc:StreetName>${this.xmlEscape(data.customerStreetName)}</cbc:StreetName>
          <cbc:BuildingNumber>${this.xmlEscape(data.customerBuildingNumber)}</cbc:BuildingNumber>
          <cbc:CitySubdivisionName>${this.xmlEscape(data.customerDistrict)}</cbc:CitySubdivisionName>
          <cbc:CityName>${this.xmlEscape(data.customerCityName)}</cbc:CityName>
          <cac:Country>
            <cbc:Name>${data.customerCountry}</cbc:Name>
          </cac:Country>
        </cac:PostalAddress>
      </cac:Party>
    </cac:CustomerParty>`;
  }

  private buildPaymentMeans(data: UBLInvoiceData): string {
    const dueDate = data.paymentDueDate || data.issueDate;
    const meansCode = data.paymentMeansCode || '42';
    return `
    <cbc:PaymentMeansCode>${meansCode}</cbc:PaymentMeansCode>
    <cbc:PaymentDueDate>${dueDate}</cbc:PaymentDueDate>
    <cbc:PaymentChannelCode>KAPINDA_ODEME</cbc:PaymentChannelCode>`;
  }

  private buildLineXml(line: UBLInvoiceLine): string {
    return `  <cac:InvoiceLine>
    <cbc:ID>${line.id}</cbc:ID>
    <cbc:Note>${this.xmlEscape(line.description)}</cbc:Note>
    <cbc:InvoicedQuantity unitCode="${line.unitCode}">${line.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">${line.lineExtensionAmount.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="TRY">${line.taxAmount.toFixed(2)}</cbc:TaxAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${this.xmlEscape(line.itemName)}</cbc:Name>
      <cac:CommodityClassification>
        <cbc:ItemClassificationCode listID="UNCL7143">${line.hsnCode || 'OTHER'}</cbc:ItemClassificationCode>
      </cac:CommodityClassification>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="TRY">${line.unitPrice.toFixed(2)}</cbc:PriceAmount>
      <cbc:BaseQuantity unitCode="${line.unitCode}">${line.quantity}</cbc:BaseQuantity>
    </cac:Price>
  </cac:InvoiceLine>`;
  }

  private xmlEscape(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  async signXml(xmlContent: string, certificateData: string): Promise<EInvoiceSignResult> {
    this.logger.log('e-Fatura imzalanıyor');

    if (!this.CERT_DATA) {
      this.logger.warn('e-Fatura sertifikası tanımlanmamış, imzasız devam ediliyor');
      return {
        signedXml: xmlContent,
        signature: 'unsigned',
        signedAt: new Date(),
      };
    }

    try {
      const crypto = require('crypto');
      const pkcs12 = Buffer.from(this.CERT_DATA, 'base64');
      const cert = crypto.createPrivateKey({ key: pkcs12, format: 'der', type: 'pkcs12', passphrase: '' });

      const signer = crypto.createSign('RSA-SHA256');
      signer.update(xmlContent, 'utf8');
      const signature = signer.sign(cert);

      const signedXml = xmlContent.replace('</Invoice>', `  <ext:UBLExtensions>
      <ext:UBLExtension>
        <ext:ExtensionContent>
          <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
            <ds:SignatureValue>${signature.toString('base64')}</ds:SignatureValue>
          </ds:Signature>
        </ext:ExtensionContent>
      </ext:UBLExtension>
    </ext:UBLExtensions>
</Invoice>`);

      return {
        signedXml,
        signature: signature.toString('base64'),
        signedAt: new Date(),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('e-Fatura imzalama hatası', { error: msg });
      return { signedXml: xmlContent, signature: 'error:' + msg, signedAt: new Date() };
    }
  }

  async sendToGib(signedXml: string, recipientId: string): Promise<EInvoiceSendResult> {
    this.logger.log('e-Fatura GİB\'e gönderiliyor', { recipientId });

    if (!this.GIB_USER || !this.GIB_PASSWORD) {
      this.logger.warn('GİB API kimlik bilgileri tanımlanmamış, test modu');
      return {
        einvoiceNumber: `EF${crypto.randomUUID()}`,
        gibStatus: 'TEST_KABUL',
        gibReceiptDate: new Date(),
      };
    }

    try {
      const payload = {
        etin: this.GIB_USER,
        password: this.GIB_PASSWORD,
        invoiceData: signedXml,
        recipientId,
      };

      const response: AxiosResponse<{ einvoiceNumber: string; status: string; receiptDate: string }> = await firstValueFrom(
        this.httpService.post(`${this.GIB_API_URL}/invoice/send`, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }),
      );

      const result = response.data;
      return {
        einvoiceNumber: result.einvoiceNumber,
        gibStatus: result.status,
        gibReceiptDate: new Date(result.receiptDate),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('GİB gönderim hatası', { error: msg });
      return {
        einvoiceNumber: `EF${crypto.randomUUID()}`,
        gibStatus: 'GONDERIM_HATASI',
        gibReceiptDate: new Date(),
      };
    }
  }

  async checkGibStatus(einvoiceNumber: string): Promise<{ status: EInvoiceStatus; receiptDate?: Date }> {
    this.logger.log('GİB durumu sorgulanıyor', { einvoiceNumber });

    if (!this.GIB_USER || !this.GIB_PASSWORD) {
      return { status: EInvoiceStatus.GIB_ACCEPTED, receiptDate: new Date() };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.GIB_API_URL}/invoice/status/${einvoiceNumber}`, {
          auth: { username: this.GIB_USER, password: this.GIB_PASSWORD },
          timeout: 15000,
        }),
      );

      const data = response.data as { status: string; receiptDate?: string };
      const status = data.status === 'KABUL' ? EInvoiceStatus.GIB_ACCEPTED : EInvoiceStatus.GIB_REJECTED;
      return {
        status,
        receiptDate: data.receiptDate ? new Date(data.receiptDate) : undefined,
      };
    } catch {
      return { status: EInvoiceStatus.GIB_REJECTED };
    }
  }

  async cancelEInvoice(einvoiceNumber: string, reason: string): Promise<void> {
    this.logger.log('e-Fatura iptal ediliyor', { einvoiceNumber, reason });

    if (!this.GIB_USER || !this.GIB_PASSWORD) {
      this.logger.warn('GİB API kimlik bilgileri yok, iptal atlanıyor');
      return;
    }

    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.GIB_API_URL}/invoice/cancel`,
          { einvoiceNumber, reason },
          { auth: { username: this.GIB_USER, password: this.GIB_PASSWORD }, timeout: 15000 },
        ),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('GİB iptal hatası', { einvoiceNumber, error: msg });
    }
  }
}