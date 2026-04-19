import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PlaceBidCommand } from './application/commands/place-bid.command';
import { DrawLotteryCommand } from './application/commands/draw-lottery.command';

export class PlaceBidDto {
  @ApiProperty()
  auctionId!: string;
  @ApiProperty()
  amount!: number;
}

export class DrawLotteryDto {
  @ApiProperty()
  lotteryId!: string;
}

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get active auctions' })
  async getActiveAuctions(@Query() query: any) {
    // TODO: GetActiveAuctionsQuery implement
    return { success: true, data: [], total: 0 }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bid')
  @ApiOperation({ summary: 'Place a bid' })
  async placeBid(@CurrentUser() user: any, @Body() dto: PlaceBidDto) {
    // Note: Command expects (auctionId, userId, amount)
    return this.commandBus.execute(new PlaceBidCommand(dto.auctionId, user.id, dto.amount))
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('draw')
  @ApiOperation({ summary: 'Draw a lottery' })
  async drawLottery(@Body() dto: DrawLotteryDto) {
    return this.commandBus.execute(new DrawLotteryCommand(dto.lotteryId))
  }
}
