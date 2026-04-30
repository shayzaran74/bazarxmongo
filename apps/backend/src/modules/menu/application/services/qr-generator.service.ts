// apps/backend/src/modules/menu/application/services/qr-generator.service.ts

import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class QrGeneratorService {
  // QR kodu: platform prefix + rastgele 16 hex
  generate(): string {
    return 'MENU-' + randomBytes(8).toString('hex').toUpperCase();
  }

  // 1+1 bedava QR kodu
  generateOneFree(): string {
    return 'FREE-' + randomBytes(8).toString('hex').toUpperCase();
  }

  // QR geçerlilik süresi: satın alım tarihinden 30 gün
  expiresAt(fromDate: Date = new Date(), days = 30): Date {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + days);
    return d;
  }
}
