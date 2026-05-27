// apps/backend/src/modules/vendor/application/dtos/update-company-status.dto.ts
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Frontend 'active' veya 'approved' → APPROVED, 'rejected' → REJECTED
const ALLOWED_STATUSES = ['active', 'approved', 'rejected'] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export class UpdateCompanyStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED', 'PENDING'] })
  status!: 'APPROVED' | 'REJECTED' | 'PENDING' | 'active' | 'rejected';

  @ApiProperty({ required: false })
  rejectionReason?: string;
}
