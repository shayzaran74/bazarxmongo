import { Injectable, Logger } from '@nestjs/common';
import { IMediaService, ImageSize } from '../../domain/services/media.service.interface';

@Injectable()
export class PassthroughMediaService implements IMediaService {
  private readonly logger = new Logger(PassthroughMediaService.name);

  async resolveUrl(urlOrId: string, size: ImageSize): Promise<string> {
    // TODO: Gerçek CDN/storage entegrasyonu eklenecek
    // Şu an URL'i olduğu gibi döndürür, boşsa empty string
    if (!urlOrId) return '';
    return urlOrId;
  }
}
