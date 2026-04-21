export const MEDIA_SERVICE = 'IMediaService';

export type ImageSize = 'thumb' | 'medium' | 'large' | 'original';

export interface IMediaService {
  /**
   * Verilen URL veya mediaId'yi istenen boyut için tam URL'e çözer.
   * Gerçek implementasyonda CDN prefix veya signed URL üretir.
   * Şu an passthrough: URL'i olduğu gibi döndürür.
   */
  resolveUrl(urlOrId: string, size: ImageSize): Promise<string>;
}
