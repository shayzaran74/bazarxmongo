// apps/backend/src/modules/garage-sale/application/services/smart-cap.service.ts
// Master Plan v4.3 §4.3 — Smart Cap: Tek bayinin tek siparişi havuz stoğunun %25'ini geçemez.
// barter-rules.md §5: MAX_POOL_SHARE_PERCENT = 25.

import { Injectable, BadRequestException } from '@nestjs/common';
import { MAX_POOL_SHARE_PERCENT, MAX_POOL_SHARE_RATIO } from '@barterborsa/shared-core';

@Injectable()
export class SmartCapService {
  /**
   * @param orderQty Sipariş edilmek istenen adet
   * @param totalPoolStock Havuz toplam stoğu (kampanya başlangıcındaki)
   * @throws SMART_CAP_EXCEEDED — sipariş %25 sınırını geçerse
   */
  validateSmartCap(orderQty: number, totalPoolStock: number): void {
    if (orderQty <= 0 || totalPoolStock <= 0) {
      throw new BadRequestException({
        code: 'INVALID_QUANTITY',
        message: 'Sipariş miktarı ve havuz stoğu pozitif olmalıdır.',
      });
    }
    const limit = Math.floor(totalPoolStock * MAX_POOL_SHARE_RATIO);
    if (orderQty > limit) {
      throw new BadRequestException({
        code: 'SMART_CAP_EXCEEDED',
        message: `Tek siparişte havuz stoğunun %${MAX_POOL_SHARE_PERCENT}'inden fazlasını alamazsınız. (Sipariş: ${orderQty}, izin verilen üst sınır: ${limit})`,
        details: { orderQty, totalPoolStock, limit, maxPercent: MAX_POOL_SHARE_PERCENT },
      });
    }
  }
}
