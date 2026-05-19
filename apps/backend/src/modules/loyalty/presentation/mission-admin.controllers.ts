// apps/backend/src/modules/loyalty/presentation/mission-admin.controllers.ts

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { IXpSpendingLimitRule } from '@barterborsa/shared-persistence';
import { XpSourceType } from '../domain/enums/loyalty.enums';
import { GetMissionsQuery }     from '../application/queries/get-missions.query';
import { GetUserMissionsQuery } from '../application/queries/get-user-missions.query';
import { EarnXpCommand }        from '../application/commands/earn-xp.command';
import { ExpireXpBatchesCommand } from '../application/commands/expire-xp-batches.command';

interface AuthenticatedUser { id: string; role: string }

@ApiTags('Missions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('missions')
export class MissionController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List all missions' })
  @Get()
  getAll() { return this.queryBus.execute(new GetMissionsQuery()); }

  @ApiOperation({ summary: 'Get my missions' })
  @Get('my')
  getMy(@CurrentUser() user: AuthenticatedUser) {
    return this.queryBus.execute(new GetUserMissionsQuery(user.id));
  }
}

@ApiTags('Loyalty Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/loyalty')
export class LoyaltyAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectModel('XpSpendingLimitRule') private readonly spendingRuleModel: Model<IXpSpendingLimitRule>,
  ) {}

  @ApiOperation({ summary: 'List spending rules' })
  @Get('spending-rules')
  getSpendingRules() {
    return this.spendingRuleModel.find().lean();
  }

  @ApiOperation({ summary: 'Grant XP to user' })
  @ApiBody({ schema: { type: 'object', properties: { userId: { type: 'string' }, amount: { type: 'number' }, type: { type: 'string' } }, required: ['userId', 'amount', 'type'] } })
  @Post('grant-xp')
  grantXp(@Body() dto: { userId: string; amount: number; type: string }) {
    return this.commandBus.execute(new EarnXpCommand(dto.userId, dto.amount, dto.type as XpSourceType));
  }

  @ApiOperation({ summary: 'Expire old XP batches' })
  @Post('expire-batches')
  expireBatches() {
    return this.commandBus.execute(new ExpireXpBatchesCommand());
  }
}
