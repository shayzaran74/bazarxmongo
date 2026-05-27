// apps/backend/src/modules/commerce/presentation/dto/resolve-dispute.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OrderDisputeResolution } from '../../application/commands/resolve-order-dispute.command';

export class ResolveOrderDisputeDto {
  @ApiProperty({ description: 'Çözüm kararı', enum: OrderDisputeResolution })
  @IsEnum(OrderDisputeResolution)
  @IsNotEmpty()
  resolution!: OrderDisputeResolution;

  @ApiProperty({ description: 'Admin notu / Karar gerekçesi' })
  @IsString()
  @IsNotEmpty()
  adminNote!: string;
}
