import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GetFavoritesQuery } from '../application/queries/get-favorites/get-favorites.query';

@ApiTags('Catalog')
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List user favorites' })
  @ApiResponse({ status: 200 })
  @Get()
  async getFavorites(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetFavoritesQuery(user.id));
    return { success: true, data };
  }
}

export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
