// apps/backend/src/modules/documents/application/services/document.service.ts

import { Injectable, Inject, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { IVendorDocumentRepository } from '../../domain/repositories/vendor-document.repository.interface';
import { VendorDocument } from '../../domain/entities/vendor-document.entity';
import { DocumentType } from '../../domain/enums/document-type.enum';
import { IMediaService, MEDIA_SERVICE } from '../../../media/domain/media.service.interface';
import { IStorageAdapter, STORAGE_ADAPTER } from '../../../media/domain/storage.adapter.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @Inject('IVendorDocumentRepository')
    private readonly documentRepo: IVendorDocumentRepository,
    @Inject(MEDIA_SERVICE)
    private readonly mediaService: IMediaService,
    @Inject(STORAGE_ADAPTER)
    private readonly storageAdapter: IStorageAdapter,
  ) {}

  /**
   * Yeni bir belge yükler. Önce MinIO'ya (private bucket'a) kaydeder, 
   * başarılıysa metadata'sını MongoDB'ye yazar. DB yazma işlemi başarısız olursa temizlik (cleanup) yapar.
   */
  async uploadDocument(
    vendorId: string,
    file: Express.Multer.File,
    documentType: DocumentType,
    uploadedBy: string,
  ): Promise<VendorDocument> {
    // 1. MinIO'ya yükle (subPath olarak 'documents' vererek private bucket'a yönlendirilir)
    const uploadResult = await this.mediaService.processAndUpload(file, { subPath: 'documents' });
    
    if (!uploadResult.success) {
      throw uploadResult.error;
    }

    const { mediaId } = uploadResult.data;

    // 2. Entity oluştur
    const documentId = randomUUID();
    const document = new VendorDocument(
      documentId,
      vendorId,
      documentType,
      mediaId, // fileKey = mediaId (MinIO nesne anahtarı)
      file.originalname,
      file.size,
      file.mimetype,
      new Date(),
      uploadedBy,
    );

    // 3. MongoDB'ye kaydet
    try {
      await this.documentRepo.save(document);
      return document;
    } catch (dbError) {
      // Hata durumunda cleanup: MinIO'ya yüklenen dosyayı geri sil
      this.logger.error(`Database save failed for document ${documentId}, running cleanup on MinIO...`, dbError);
      try {
        await this.storageAdapter.delete(mediaId);
      } catch (minioError) {
        this.logger.error(`Cleanup failed to delete file ${mediaId} on MinIO`, minioError);
      }
      throw dbError;
    }
  }

  /**
   * İstenen belgenin geçici imzalı (presigned) erişim URL'ini üretir.
   * Yetkisiz satıcıların erişimini engeller. Admin ise sahiplik doğrulaması pas geçilir.
   * TTL (saniye cinsinden) parametrik olarak belirlenebilir (Varsayılan 3600sn = 60dk).
   */
  async getSignedUrl(
    documentId: string,
    requestingVendorId?: string,
    isAdmin = false,
    ttl = 3600,
  ): Promise<string> {
    const document = await this.documentRepo.findById(documentId);
    if (!document) {
      throw new NotFoundException('Belge bulunamadı');
    }

    // Admin değilse sahiplik (ownership) doğrulaması yap
    if (!isAdmin && (!requestingVendorId || !document.isOwnedBy(requestingVendorId))) {
      throw new ForbiddenException('Bu belgeye erişim yetkiniz yok');
    }

    // MinIO presigned URL üret
    return this.storageAdapter.getPresignedUrl(document.fileKey, ttl);
  }

  /**
   * Satıcıya ait tüm belgeleri listeler.
   */
  async listDocuments(vendorId: string): Promise<VendorDocument[]> {
    return this.documentRepo.findByVendorId(vendorId);
  }

  /**
   * Belgeyi sistemden siler. Hem veritabanından hem de MinIO'dan kaldırır.
   * Admin değilse yetkisiz satıcıların silme işlemini engeller.
   */
  async deleteDocument(
    documentId: string,
    requestingVendorId?: string,
    isAdmin = false,
  ): Promise<void> {
    const document = await this.documentRepo.findById(documentId);
    if (!document) {
      throw new NotFoundException('Belge bulunamadı');
    }

    // Admin değilse sahiplik (ownership) doğrulaması yap
    if (!isAdmin && (!requestingVendorId || !document.isOwnedBy(requestingVendorId))) {
      throw new ForbiddenException('Bu belgeyi silme yetkiniz yok');
    }

    // 1. Veritabanından sil
    await this.documentRepo.delete(documentId);

    // 2. MinIO'dan sil
    try {
      await this.storageAdapter.delete(document.fileKey);
    } catch (minioError) {
      this.logger.error(`Failed to delete document file ${document.fileKey} from MinIO during deletion`, minioError);
    }
  }
}
