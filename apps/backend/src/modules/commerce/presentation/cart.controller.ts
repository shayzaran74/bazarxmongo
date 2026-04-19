import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { AddToCartDto } from '../application/dtos/add-to-cart.dto';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, Public } from '@barterborsa/shared-security';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Add product to cart', description: 'Sepete yeni bir ürün ekler veya mevcut ürünün adedini artırır.' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, description: 'Ürün sepete eklendi.' })
  @ApiResponse({ status: 401, description: 'Yetkilendirme gerekli.' })
  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    // Command implementation would go here
    return { success: true, message: 'Added to cart stub' };
  }

  @ApiOperation({ summary: 'Get current cart', description: 'Kullanıcının aktif sepetindeki ürünleri ve toplam tutarı döner.' })
  @ApiResponse({ status: 200, description: 'Sepet detayları.' })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@CurrentUser() user: any) {
    // Query implementation would go here
    return { items: [], total: 0 };
  }

  @Public()
  @ApiOperation({ summary: 'Get available escrow coupons', description: 'Kullanılabilir emanet kuponlarını listeler.' })
  @Get('escrow-coupons')
  async getEscrowCoupons() {
    return { success: true, data: [] };
  }
}
