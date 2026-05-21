import { CurrentUser } from '@barterborsa/shared-nest';
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
import { ReturnReasonType } from '../domain/enums/return-reason-type.enum';
import { IsString, IsArray, IsEnum, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class ReturnItemDto {
  @IsString()
  orderItemId!: string;

  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateReturnRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items!: ReturnItemDto[];

  @IsString()
  reason!: string;

  @IsEnum(ReturnReasonType)
  reasonType!: ReturnReasonType;
}

export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }

@Controller()
@UseGuards(JwtAuthGuard)
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post('orders/:id/return')
  @HttpCode(HttpStatus.CREATED)
  async createReturn(
    @Param('id') orderId: string,
    @Body() dto: CreateReturnRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.returnService.createReturn(user.id, {
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
  async approveReturn(@Param('id') orderId: string, @CurrentUser() user: AuthenticatedUser) {
    const result = await this.returnService.approveReturn(orderId, user.vendorId!);
    return result;
  }

  @Post('orders/:id/return/reject')
  @HttpCode(HttpStatus.OK)
  async rejectReturn(
    @Param('id') orderId: string,
    @Body() body: { reason: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.returnService.rejectReturn(
      orderId,
      user.vendorId!,
      body.reason,
    );
    return result;
  }

  @Post('orders/:id/return/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelReturn(@Param('id') orderId: string, @CurrentUser() user: AuthenticatedUser) {
    return { success: false, error: 'Not implemented' };
  }
}
export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
