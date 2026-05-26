// apps/backend/src/modules/documents/domain/repositories/vendor-document.repository.interface.ts

import { VendorDocument } from '../entities/vendor-document.entity';

/**
 * Satıcı belgeleri veritabanı işlemleri için repository port arayüzü.
 */
export interface IVendorDocumentRepository {
  /**
   * Belgeyi benzersiz kimliğine göre bulur.
   */
  findById(id: string): Promise<VendorDocument | null>;

  /**
   * Bir satıcıya ait tüm belgeleri listeler.
   */
  findByVendorId(vendorId: string): Promise<VendorDocument[]>;

  /**
   * Belgeyi kaydeder veya günceller.
   */
  save(document: VendorDocument): Promise<void>;

  /**
   * Belgeyi siler.
   */
  delete(id: string): Promise<void>;
}
