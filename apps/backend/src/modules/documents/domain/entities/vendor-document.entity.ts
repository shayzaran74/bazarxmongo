// apps/backend/src/modules/documents/domain/entities/vendor-document.entity.ts

import { DocumentType } from '../enums/document-type.enum';

/**
 * Vendor belgelerini temsil eden DDD Entity.
 */
export class VendorDocument {
  constructor(
    public readonly id: string,
    public readonly vendorId: string,
    public readonly documentType: DocumentType,
    public readonly fileKey: string, // MinIO üzerindeki benzersiz dosya anahtarı (mediaId)
    public readonly fileName: string, // Orijinal dosya adı
    public readonly fileSize: number, // Bayt cinsinden boyut
    public readonly mimeType: string, // Mime türü (örn: application/pdf)
    public readonly uploadedAt: Date, // Yükleme tarihi
    public readonly uploadedBy: string, // Yükleyen kullanıcının ID'si
  ) {}

  /**
   * Belgenin belirtilen satıcıya (vendor) ait olup olmadığını kontrol eder.
   */
  isOwnedBy(vendorId: string): boolean {
    return this.vendorId === vendorId;
  }
}
