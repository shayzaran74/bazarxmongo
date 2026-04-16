// apps/backend/src/modules/loyalty/presentation/mission-admin.controllers.ts

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, Roles } from '@barterborsa/shared-nest';
import * as qry from '../application/queries/loyalty.queries';
import * as cmd from '../application/commands/loyalty.commands';

@Controller('missions')
export class MissionController {
  constructor(private readonly queryBus: QueryBus) {}
  @Get()
  async getAll() { return this.queryBus.execute(new qry.GetMissionsQuery()); }
  @Get('my')
  async getMy(@CurrentUser() user: any) { return this.queryBus.execute(new qry.GetUserMissionsQuery(user.id)); }
}

@Controller('admin/loyalty')
@Roles('ADMIN')
export class LoyaltyAdminController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}
  @Get('spending-rules')
  async getSpendingRules() { return []; } // Implementation can be expanded
  @Post('grant-xp')
  async grantXp(@Body() dto: any) { return this.commandBus.execute(new cmd.EarnXpCommand(dto.userId, dto.amount, dto.type)); }
  @Post('expire-batches')
  async expireBatches() { return this.commandBus.execute(new cmd.ExpireXpBatchesCommand()); }
}
