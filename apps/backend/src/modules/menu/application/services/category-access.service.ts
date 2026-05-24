// apps/backend/src/modules/menu/application/services/category-access.service.ts
// Düzeltme 4: Tier ↔ Kategori erişim kontrolü + preview hakları

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenuPurchase } from '@barterborsa/shared-persistence';

export type AccessMode = 'FULL' | 'PREVIEW' | 'DENIED';

export interface AccessCheckResult {
  allowed: boolean;
  mode: AccessMode;
  previewRemainingThisMonth: number;
}

@Injectable()
export class CategoryAccessService {
  private readonly logger = new Logger(CategoryAccessService.name);

  // FULL_ACCESS_MAP: en premium kategorinin numarası (düşük = üst segment)
  private readonly FULL_ACCESS_MAP: Record<string, number> = {
    BRONZE_P1: 6, BRONZE_P2: 5, SILVER_P1: 4, SILVER_P2: 3,
    GOLD_P1: 2,   GOLD_P2: 2,   DIAMOND_P1: 1, DIAMOND_P2: 1,
  };

  constructor(
    @InjectModel('MenuPurchase') private readonly purchaseModel: Model<IMenuPurchase>,
  ) {}

  /**
   * Kullanıcının belirli bir kategoriye erişimini kontrol eder.
   * Tam erişim: categoryLevel >= fullAccessThreshold (düşük numara = üst segment)
   * Preview: categoryLevel === fullAccessThreshold - 1 AND bu ay kullanılmamış
   * Yoks驳: daha düşük kategoriler veya preview hakkı tükenmiş
   */
  async checkAccess(userId: string, categoryLevel: number, userTier: string): Promise<AccessCheckResult> {
    const fullAccessThreshold = this.FULL_ACCESS_MAP[userTier] ?? 6;

    // Tam erişim: kategori numarası >= eşik (düşük numara = üst segment)
    if (categoryLevel >= fullAccessThreshold) {
      return { allowed: true, mode: 'FULL', previewRemainingThisMonth: 0 };
    }

    // Preview: bir alt kategori mi?
    if (categoryLevel === fullAccessThreshold - 1) {
      const used = await this.previewUsedThisMonth(userId, categoryLevel);
      if (!used) {
        return { allowed: true, mode: 'PREVIEW', previewRemainingThisMonth: 0 };
      }
      return { allowed: false, mode: 'DENIED', previewRemainingThisMonth: 0 };
    }

    // Daha düşük kategoriler tamamen yasak
    return { allowed: false, mode: 'DENIED', previewRemainingThisMonth: 0 };
  }

  private async previewUsedThisMonth(userId: string, categoryLevel: number): Promise<boolean> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const existing = await this.purchaseModel.findOne({
      userId,
      purchaseType: 'PREVIEW',
      previewCategoryId: categoryLevel,
      previewUsedAt: { $gte: startOfMonth },
    }).lean();

    return !!existing;
  }

  /** Preview kullanıldığında çağır — MenuPurchase kaydını güncelle */
  async markPreviewUsed(purchaseId: string): Promise<void> {
    await this.purchaseModel.findByIdAndUpdate(purchaseId, {
      previewUsedAt: new Date(),
    });
  }
}