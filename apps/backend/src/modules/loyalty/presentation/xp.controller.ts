// apps/backend/src/modules/loyalty/presentation/xp.controller.ts

import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, Roles } from '@barterborsa/shared-nest';
import { GetXpBalanceQuery, GetXpHistoryQuery } from '../application/queries/loyalty.queries';
import { EarnXpCommand } from '../application/commands/loyalty.commands';
import { XpSourceType } from '../domain/enums/loyalty.enums';

@Controller('xp')
export class XpController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get('balance')
  async getBalance(@CurrentUser() user: any) {
    return this.queryBus.execute(new GetXpBalanceQuery(user.id));
  }

  @Get('history')
  async getHistory(@CurrentUser() user: any, @Query('skip') skip: number, @Query('take') take: number) {
    return this.queryBus.execute(new GetXpHistoryQuery(user.id, Number(skip || 0), Number(take || 20)));
  }

  @Post('earn')
  @Roles('ADMIN')
  async earnXp(@Body() dto: { userId: string, amount: number, type: XpSourceType }) {
    return this.commandBus.execute(new EarnXpCommand(dto.userId, dto.amount, dto.type));
  }
}
