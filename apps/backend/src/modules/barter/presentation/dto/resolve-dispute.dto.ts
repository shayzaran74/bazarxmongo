// apps/backend/src/modules/barter/presentation/dto/resolve-dispute.dto.ts
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { DisputeResolutionResult } from '../../domain/enums/dispute-resolution-result.enum';

export class ResolveDisputeDto {
  @IsEnum(DisputeResolutionResult)
  result: DisputeResolutionResult;

  @IsString()
  @IsNotEmpty()
  adminNote: string;
}
