import { CurrentUser } from '@barterborsa/shared-nest';
// apps/backend/src/modules/vendor/presentation/vendor-score.controller.ts
// VendorScoreController — Satıcı puanı ve ihlal yönetimi

import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { VendorScoreService, VendorScoreVO, ViolationVO } from '../application/services/vendor-score.service';
import { VendorViolationType } from '../domain/enums/vendor-violation-type.enum';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorScoreController {
  constructor(private readonly vendorScoreService: VendorScoreService) {}

  /**
   * GET /vendors/me/score
   * Satıcının kendi score'unu getir
   */
  @Get('me/score')
  async getMyScore(@CurrentUser() user: AuthenticatedUser) {
    const vendorId = user.vendorId!;
    if (!vendorId) {
      throw new HttpException('Satıcı profili bulunamadı', HttpStatus.NOT_FOUND);
    }

    const score = await this.vendorScoreService.getVendorScore(vendorId);
    if (!score) {
      throw new HttpException('Score bulunamadı', HttpStatus.NOT_FOUND);
    }

    return { success: true, data: score };
  }

  /**
   * GET /vendors/me/violations
   * Satıcının aktif ihlallerini getir
   */
  @Get('me/violations')
  async getMyViolations(@CurrentUser() user: AuthenticatedUser) {
    const vendorId = user.vendorId!;
    if (!vendorId) {
      throw new HttpException('Satıcı profili bulunamadı', HttpStatus.NOT_FOUND);
    }

    const violations = await this.vendorScoreService.getVendorViolations(vendorId);
    return { success: true, data: violations };
  }

  /**
   * GET /admin/vendors/:id/score
   * Admin: belirli satıcının score'unu getir
   */
  @Get('admin/vendors/:id/score')
  async getVendorScore(@Param('id') vendorId: string) {
    const score = await this.vendorScoreService.getVendorScore(vendorId);
    if (!score) {
      throw new HttpException('Score bulunamadı', HttpStatus.NOT_FOUND);
    }
    return { success: true, data: score };
  }

  /**
   * GET /admin/vendors/:id/violations
   * Admin: belirli satıcının ihlallerini getir
   */
  @Get('admin/vendors/:id/violations')
  async getVendorViolations(@Param('id') vendorId: string) {
    const violations = await this.vendorScoreService.getVendorViolations(vendorId);
    return { success: true, data: violations };
  }

  /**
   * POST /admin/vendors/:id/violations
   * Admin: satıcıya ihlal ekle
   */
  @Post('admin/vendors/:id/violations')
  async addVendorViolation(
    @Param('id') vendorId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Record<string, any>,
  ) {
    const { type, description, relatedEntityId, relatedEntityType, severity, penaltyScore } = body;

    if (!type || !description) {
      throw new HttpException('type ve description zorunludur', HttpStatus.BAD_REQUEST);
    }

    // Enum validation
    if (!Object.values(VendorViolationType).includes(type)) {
      throw new HttpException(`Geçersiz violation type: ${type}`, HttpStatus.BAD_REQUEST);
    }

    const violation = await this.vendorScoreService.addViolation({
      vendorId,
      type,
      description,
      relatedEntityId,
      relatedEntityType,
      severity,
      penaltyScore,
    });

    return { success: true, data: violation };
  }

  /**
   * POST /admin/violations/:id/deactivate
   * Admin: ihlali pasif yap (affetme)
   */
  @Post('admin/violations/:id/deactivate')
  async deactivateViolation(@Param('id') violationId: string) {
    await this.vendorScoreService.deactivateViolation(violationId);
    return { success: true, message: 'İhlal pasif yapıldı' };
  }

  /**
   * POST /vendors/:id/score/recalculate
   * Admin veya sistem: score'u yeniden hesapla
   */
  @Post(':id/score/recalculate')
  async recalculateScore(@Param('id') vendorId: string) {
    const score = await this.vendorScoreService.recalculateScore(vendorId);
    return { success: true, data: score };
  }
}
export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
