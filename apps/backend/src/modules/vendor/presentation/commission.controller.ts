// apps/backend/src/modules/vendor/presentation/commission.controller.ts

import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CommissionEngineService } from '../application/services/commission-engine.service';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

interface AuthenticatedUser { id: string; role: string; }

class CommissionPreviewDto {
  @IsNumber() @Min(1)  transactionAmount!:  number;
  @IsBoolean() @IsOptional() isGroupTransaction?: boolean;
  @IsNumber()  @IsOptional() @Min(0) xpToApply?: number;
}

@ApiTags('Commission')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
@Controller('commission')
export class CommissionController {
  constructor(
    private readonly engine:  CommissionEngineService,
    private readonly prisma:  PrismaService,
  ) {}

  @ApiOperation({ summary: 'Komisyon ön hesaplama (kayıt yok)' })
  @ApiBody({ type: CommissionPreviewDto })
  @Post('preview')
  async preview(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CommissionPreviewDto,
  ) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) return { success: false, message: 'Vendor bulunamadı' };

    const breakdown = await this.engine.preview({
      vendorId:           vendor.id,
      transactionAmount:  dto.transactionAmount,
      isGroupTransaction: dto.isGroupTransaction ?? false,
      xpToApply:          dto.xpToApply ?? 0,
      referenceId:        'PREVIEW',
      referenceType:      'TRADE',
    });

    return { success: true, data: breakdown };
  }

  @ApiOperation({ summary: 'Kendi komisyon geçmişim' })
  @Get('my-history')
  async myHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    // Financial-service commission records üzerinden çek
    // (gRPC ya da direkt erişim — şu an backend DB'sinde yok, ileride entegre edilecek)
    return {
      success: true,
      data:    { items: [], total: 0, note: 'Commission history financial-service üzerinden Faz 6\'da entegre edilecek' },
    };
  }
}
