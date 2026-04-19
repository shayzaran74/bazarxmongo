import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Catalog')
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List user favorites', description: 'Kullanıcının favoriye eklediği ürünleri listeler.' })
  @ApiResponse({ status: 200, description: 'Favori listesi.' })
  @Get()
  async getFavorites(@CurrentUser() user: any) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        product: true
      }
    });
    
    return {
      success: true,
      data: favorites.map(f => f.product)
    };
  }
}
