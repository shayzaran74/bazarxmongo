// apps/backend/src/modules/commerce/application/dtos/cancel-order-admin.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CancelOrderAdminDto {
  @IsString()
  reason!: string;

  // Eğer sipariş ödenmişse, otomatik iade tetiklensin mi?
  @IsBoolean()
  @IsOptional()
  refund?: boolean;
}
