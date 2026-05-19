// apps/backend/src/modules/commerce/presentation/return.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { ReturnService } from '../application/services/return.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post('orders/:id/return')
  @HttpCode(HttpStatus.CREATED)
  async createReturn(
    @Param('id') orderId: string,
    @Body() dto: any,
    @Request() req: any,
  ) {
    const result = await this.returnService.createReturn(req.user.id, {
      ...dto,
      orderId,
    });
    return { success: true, data: result };
  }

  @Get('orders/:id/return')
  async getReturn(@Param('id') orderId: string) {
    return { success: true, data: null };
  }

  @Post('orders/:id/return/approve')
  @HttpCode(HttpStatus.OK)
  async approveReturn(@Param('id') orderId: string, @Request() req: any) {
    const result = await this.returnService.approveReturn(orderId, req.user.vendorId);
    return result;
  }

  @Post('orders/:id/return/reject')
  @HttpCode(HttpStatus.OK)
  async rejectReturn(
    @Param('id') orderId: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    const result = await this.returnService.rejectReturn(
      orderId,
      req.user.vendorId,
      body.reason,
    );
    return result;
  }

  @Post('orders/:id/return/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelReturn(@Param('id') orderId: string, @Request() req: any) {
    return { success: false, error: 'Not implemented' };
  }
}