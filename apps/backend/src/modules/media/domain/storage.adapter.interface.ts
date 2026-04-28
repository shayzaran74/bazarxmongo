// apps/backend/src/modules/media/domain/storage.adapter.interface.ts
export interface StorageUploadResult {
  mediaId: string;
  publicUrl: string;
  blurhash: string | null;
}

export const STORAGE_ADAPTER = 'IStorageAdapter';

export interface IStorageAdapter {
  upload(
    file: any, // Multer.File
    path: string
  ): Promise<StorageUploadResult>;
  getUrl(mediaId: string, size?: string): Promise<string>;
  delete(mediaId: string): Promise<void>;
}
