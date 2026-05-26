// apps/backend/src/modules/documents/domain/enums/document-type.enum.ts

/**
 * Vendor belgeleri için izin verilen doküman türleri.
 */
export enum DocumentType {
  INVOICE = 'INVOICE',           // Fatura
  STATEMENT = 'STATEMENT',       // Hesap Ekstresi
  TAX_DOCUMENT = 'TAX_DOCUMENT', // Vergi Levhası / Beyanname
  ACCOUNTING = 'ACCOUNTING',     // Muhasebe / Finans Belgesi
  OTHER = 'OTHER'                // Diğer Belgeler
}
