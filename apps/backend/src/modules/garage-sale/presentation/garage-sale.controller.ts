// apps/backend/src/modules/garage-sale/presentation/garage-sale.controller.ts
// Master Plan v4.3 §4.4 — Garaj Günü REST API.

import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IsInt, IsISO8601, IsNumber, IsString, Min, Max } from 'class-validator';
import { JwtAuthGuard, Roles, RolesGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { IGarageSale } from '@barterborsa/shared-persistence';
import { CreateGarageSaleCommand } from '../application/commands/create-garage-sale.command';
import { PurchaseFromGarageSaleCommand } from '../application/commands/purchase-from-garage-sale.command';

interface AuthenticatedUser { id: string; role: string; }

class CreateGarageSaleBodyDto {
  @IsString() ecosystemId!: string;
  @IsString() listingId!: string;
  @IsString() normalPrice!: string;       // Decimal string — float yasak
  @IsNumber() @Min(0.01) @Max(0.99) discountRate!: number;
  @IsInt() @Min(1) maxTotalQty!: number;
  @IsInt() @Min(1) maxQtyPerDealer!: number;
  @IsISO8601() startsAt!: string;
  @IsISO8601() endsAt!: string;
}

class PurchaseBodyDto {
  @IsInt() @Min(1) quantity!: number;
}

@ApiTags('Garage Sale')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('garage-sales')
export class GarageSaleController {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectModel('GarageSale') private readonly gsModel: Model<IGarageSale>,
  ) {}

  // APEX fabrika kampanya açar
  @Post()
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateGarageSaleBodyDto) {
    const data = await this.commandBus.execute(new CreateGarageSaleCommand(user.id, dto));
    return { success: true, data };
  }

  // Bayi sipariş verir
  @Post(':id/purchase')
  @Roles('VENDOR')
  async purchase(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: PurchaseBodyDto,
  ) {
    const data = await this.commandBus.execute(new PurchaseFromGarageSaleCommand(user.id, id, body.quantity));
    return { success: true, data };
  }

  // Ekosistemde aktif kampanyaları listele (bayi görür)
  @Get('active')
  async listActive(@Query('ecosystemId') ecosystemId: string) {
    const now = new Date();
    const items = await this.gsModel.find({
      ecosystemId,
      status: 'ACTIVE',
      startsAt: { $lte: now },
      endsAt: { $gt: now },
    }).lean();
    return { success: true, data: items };
  }
}
