// apps/backend/src/modules/commerce/presentation/cart.controller.ts

import {
  Controller, Post, Body, Get, UseGuards,
  Delete, Param, Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';
import { AddToCartDto } from '../application/dtos/add-to-cart.dto';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, Public } from '@barterborsa/shared-security';
import { AddToCartCommand } from '../application/commands/add-to-cart.command';
import { UpdateCartItemCommand } from '../application/commands/update-cart-item.command';
import { RemoveCartItemCommand } from '../application/commands/remove-cart-item.command';
import { ClearCartCommand } from '../application/commands/clear-cart.command';
import { MergeCartCommand } from '../application/commands/merge-cart.command';
import { GetCartQuery } from '../application/queries/get-cart.query';

import { IsString, IsInt, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GuestCartItemDto {
  @ApiProperty({ example: 'listing-uuid' })
  @IsString()
  listingId!: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 99 })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}

class MergeCartDto {
  @ApiProperty({ type: [GuestCartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDto)
  items!: GuestCartItemDto[];
}

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Sepete ürün ekle' })
  @ApiBody({ type: AddToCartDto })
  @Post()
  @UseGuards(JwtAuthGuard)
  async addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.commandBus.execute(
      new AddToCartCommand(user.id, dto.listingId, dto.productId, dto.quantity),
    );
  }

  @ApiOperation({ summary: 'Misafir sepetini kullanıcı sepetine aktar (login sonrası)' })
  @ApiBody({ type: MergeCartDto })
  @Post('merge')
  @UseGuards(JwtAuthGuard)
  async mergeCart(@CurrentUser() user: any, @Body() dto: MergeCartDto) {
    return this.commandBus.execute(new MergeCartCommand(user.id, dto.items));
  }

  @ApiOperation({ summary: 'Mevcut sepeti getir' })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@CurrentUser() user: any) {
    const data = await this.queryBus.execute(new GetCartQuery(user.id));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Sepet item miktarını güncelle' })
  @Patch(':itemId')
  @UseGuards(JwtAuthGuard)
  async updateQuantity(
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.commandBus.execute(new UpdateCartItemCommand(itemId, quantity));
  }

  @ApiOperation({ summary: 'Sepetten ürün kaldır' })
  @Delete(':itemId')
  @UseGuards(JwtAuthGuard)
  async removeItem(@Param('itemId') itemId: string) {
    return this.commandBus.execute(new RemoveCartItemCommand(itemId));
  }

  @ApiOperation({ summary: 'Sepeti temizle' })
  @Delete()
  @UseGuards(JwtAuthGuard)
  async clearCart(@CurrentUser() user: any) {
    return this.commandBus.execute(new ClearCartCommand(user.id));
  }

  @Public()
  @ApiOperation({ summary: 'Escrow kuponları listele (stub)' })
  @Get('escrow-coupons')
  async getEscrowCoupons() {
    return { success: true, data: [] };
  }
}
