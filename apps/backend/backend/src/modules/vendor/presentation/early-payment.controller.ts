import { CurrentUser } from '@barterborsa/shared-nest';
// apps/backend/src/modules/vendor/presentation/early-payment.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { EarlyPaymentService, CreateEarlyPaymentDto } from '../application/services/early-payment.service';

@Controller('vendors/me/early-payment')
@UseGuards(JwtAuthGuard)
export class EarlyPaymentController {
  constructor(private readonly earlyPaymentService: EarlyPaymentService) {}

  /**
   * GET /vendors/me/early-payment/eligible
   * Satıcının erken ödeme eligibility kontrolü
   */
  @Get('eligible')
  async checkEligibility(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.earlyPaymentService.checkEligibility(user.vendorId!);
    return { success: true, data: result };
  }

  /**
   * POST /vendors/me/early-payment
   * Erken ödeme talebi oluştur
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRequest(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateEarlyPaymentDto) {
    try {
      const result = await this.earlyPaymentService.createRequest(user.vendorId!, body);
      return { success: true, data: result };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      return { success: false, error: msg };
    }
  }

  /**
   * GET /vendors/me/early-payments
   * Satıcının erken ödeme talepleri listesi
   */
  @Get()
  async listRequests(@CurrentUser() user: AuthenticatedUser) {
    return { success: true, data: { items: [], total: 0 } };
  }
}

@Controller('admin/early-payments')
@UseGuards(JwtAuthGuard)
export class AdminEarlyPaymentController {
  constructor(private readonly earlyPaymentService: EarlyPaymentService) {}

  /**
   * GET /admin/early-payments
   * Tüm erken ödeme taleplerini listele
   */
  @Get()
  async listAll(@CurrentUser() user: AuthenticatedUser) {
    return { success: true, data: { items: [], total: 0 } };
  }

  /**
   * POST /admin/early-payments/:id/approve
   * Admin onay verir
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveRequest(
    @Param('id') id: string,
    @Body() body: { payeeAccountId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.earlyPaymentService.approveRequest(
      id,
      user.id,
      body.payeeAccountId,
    );
    return result;
  }

  /**
   * POST /admin/early-payments/:id/reject
   * Admin reddeder
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectRequest(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.earlyPaymentService.rejectRequest(
      id,
      user.id,
      body.reason,
    );
    return result;
  }
}
export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
