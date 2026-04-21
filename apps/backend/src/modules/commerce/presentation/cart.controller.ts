import { Controller, Post, Body, Get, UseGuards,
         Put, Delete, Param, Patch } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AddToCartDto } from '../application/dtos/add-to-cart.dto';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, Public } from '@barterborsa/shared-security';
import { AddToCartCommand }
  from '../application/commands/add-to-cart.command';
import { UpdateCartItemCommand }
  from '../application/commands/update-cart-item.command';
import { RemoveCartItemCommand }
  from '../application/commands/remove-cart-item.command';
import { ClearCartCommand }
  from '../application/commands/clear-cart.command';
import { GetCartQuery }
  from '../application/queries/get-cart.query';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Add product to cart' })
  @ApiBody({ type: AddToCartDto })
  @Post()
  @UseGuards(JwtAuthGuard)
  async addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.commandBus.execute(
      new AddToCartCommand(user.id, dto.listingId, dto.productId, dto.quantity)
    );
  }

  @ApiOperation({ summary: 'Get current cart' })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@CurrentUser() user: any) {
    const data = await this.queryBus.execute(new GetCartQuery(user.id));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update cart item quantity' })
  @Patch(':itemId')
  @Put(':itemId')
  @UseGuards(JwtAuthGuard)
  async updateQuantity(
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number
  ) {
    return this.commandBus.execute(
      new UpdateCartItemCommand(itemId, quantity)
    );
  }

  @ApiOperation({ summary: 'Remove item from cart' })
  @Delete(':itemId')
  @UseGuards(JwtAuthGuard)
  async removeItem(@Param('itemId') itemId: string) {
    return this.commandBus.execute(new RemoveCartItemCommand(itemId));
  }

  @ApiOperation({ summary: 'Clear entire cart' })
  @Delete()
  @UseGuards(JwtAuthGuard)
  async clearCart(@CurrentUser() user: any) {
    return this.commandBus.execute(new ClearCartCommand(user.id));
  }

  @Public()
  @ApiOperation({ summary: 'Get available escrow coupons' })
  @Get('escrow-coupons')
  async getEscrowCoupons() {
    return { success: true, data: [] };
  }
}
