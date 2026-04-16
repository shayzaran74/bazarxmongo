import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiBody 
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { GetXpBalanceQuery, GetXpHistoryQuery } from '../application/queries/loyalty.queries';
import { EarnXpCommand } from '../application/commands/loyalty.commands';
import { XpSourceType } from '../domain/enums/loyalty.enums';

@ApiTags('XP & Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('xp')
export class XpController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get XP balance', description: 'Kullanıcının mevcut toplam XP puanını ve seviye (level) bilgisini döner.' })
  @ApiResponse({ status: 200, description: 'XP bakiye bilgisi.' })
  @Get('balance')
  async getBalance(@CurrentUser() user: any) {
    return this.queryBus.execute(new GetXpBalanceQuery(user.id));
  }

  @ApiOperation({ summary: 'Get XP history', description: 'Kullanıcının XP kazanma ve harcama geçmişini listeler.' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'XP geçmişi listesi.' })
  @Get('history')
  async getHistory(@CurrentUser() user: any, @Query('skip') skip: number, @Query('take') take: number) {
    return this.queryBus.execute(new GetXpHistoryQuery(user.id, Number(skip || 0), Number(take || 20)));
  }

  @ApiOperation({ summary: 'Earn XP manually (Admin)', description: 'Yönetici tarafından bir kullanıcıya manuel XP ekler.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        amount: { type: 'number', example: 100 },
        type: { enum: Object.values(XpSourceType), example: XpSourceType.ADMIN_MANUAL }
      },
      required: ['userId', 'amount', 'type']
    }
  })
  @ApiResponse({ status: 201, description: 'XP başarıyla eklendi.' })
  @ApiResponse({ status: 403, description: 'Sadece admin yetkisi ile erişilebilir.' })
  @Post('earn')
  @Roles('ADMIN')
  async earnXp(@Body() dto: { userId: string, amount: number, type: XpSourceType }) {
    return this.commandBus.execute(new EarnXpCommand(dto.userId, dto.amount, dto.type));
  }
}
