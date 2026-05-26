// apps/backend/src/modules/catalog/application/services/import-category-resolver.service.ts

import { Injectable, Inject, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isValidObjectId } from 'mongoose';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';

@Injectable()
export class ImportCategoryResolverService implements OnModuleInit {
  private readonly logger = new Logger(ImportCategoryResolverService.name);
  private defaultCategoryId!: string;

  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepo: ICategoryRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Uygulama ayağa kalkarken varsayılan kategori ID'sinin doğruluğunu kontrol eder.
   */
  async onModuleInit() {
    const defaultId = this.configService.get<string>('IMPORT_DEFAULT_CATEGORY_ID');
    const isValidId = defaultId && (isValidObjectId(defaultId) || defaultId.startsWith('cat-'));

    if (!defaultId || !isValidId) {
      throw new Error(
        'IMPORT_DEFAULT_CATEGORY_ID env değişkeni eksik veya geçersiz. ' +
        'Uygulama başlatılamaz.'
      );
    }

    // Veritabanında bu ID ile bir kategorinin olup olmadığını kontrol et
    const exists = await this.categoryRepo.findById(defaultId);
    if (!exists) {
      throw new Error(
        `IMPORT_DEFAULT_CATEGORY_ID (${defaultId}) veritabanında bulunamadı.`
      );
    }

    this.defaultCategoryId = defaultId;
    this.logger.log(`Kategori Güvenlik Duvarı aktif. Varsayılan Kategori ID: ${this.defaultCategoryId} (Genel)`);
  }

  /**
   * Verilen kategori girdisini (ID veya Name/Slug) geçerli bir kategori ID'sine çözümler.
   * Kategori bulunamazsa varsayılan kategori ID'sini döner. Kesinlikle yeni kategori oluşturmaz.
   */
  async resolveCategoryId(input: string | null | undefined): Promise<string> {
    const cleanInput = input?.trim();

    if (!cleanInput) {
      this.logger.warn(`[ImportCategoryResolver] Kategori girdisi boş → varsayılan kullanıldı (${this.defaultCategoryId})`);
      return this.defaultCategoryId;
    }

    // 1. Durum: Girdi geçerli bir ID formatındaysa (standart 24-char ObjectId veya "cat-" ile başlayan özel ID)
    const isIdFormat = /^[0-9a-fA-F]{24}$/.test(cleanInput) || cleanInput.startsWith('cat-');
    if (isIdFormat) {
      const exists = await this.categoryRepo.findById(cleanInput);
      if (exists) {
        return exists.id;
      }
      this.logger.warn(`[ImportCategoryResolver] ID ile kategori bulunamadı: "${cleanInput}" → varsayılan kullanıldı (${this.defaultCategoryId})`);
      return this.defaultCategoryId;
    }

    // 2. Durum: Girdi isim veya slug ipucudur. findByNameOrSlug kullanarak arayalım.
    const matchedCategory = await this.categoryRepo.findByNameOrSlug(cleanInput);
    if (matchedCategory) {
      return matchedCategory.id;
    }

    this.logger.warn(`[ImportCategoryResolver] İsim/Slug ile kategori bulunamadı: "${cleanInput}" → varsayılan kullanıldı (${this.defaultCategoryId})`);
    return this.defaultCategoryId;
  }
}
