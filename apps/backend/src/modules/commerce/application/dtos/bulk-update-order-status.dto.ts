// apps/backend/src/modules/commerce/application/dtos/bulk-update-order-status.dto.ts
import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator';
import { OrderStatus } from '../../domain/enums/order-status.enum';

export class BulkUpdateOrderStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderIds!: string[];

  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
