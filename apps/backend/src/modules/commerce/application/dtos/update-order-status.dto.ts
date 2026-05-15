// apps/backend/src/modules/commerce/application/dtos/update-order-status.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../domain/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
