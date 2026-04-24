import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GetMyEcosystemQuery } from '../application/queries/get-my-ecosystem.query';
import { GetEcosystemAuditLogsQuery } from '../application/queries/get-ecosystem-audit-logs.query';
import { CreateEcosystemCommand } from '../application/commands/create-ecosystem.command';
import { AddEcosystemMemberCommand } from '../application/commands/add-ecosystem-member.command';

@ApiTags('Ecosystem')
@ApiBearerAuth()
@Controller('ecosystem')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EcosystemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Get my ecosystem status' })
  @Get('my')
  async getMyEcosystem(@CurrentUser() user: any) {
    const data = await this.queryBus.execute(
      new GetMyEcosystemQuery(user.id)
    );
    if (!data) return { success: false, message: 'Vendor not found' };
    return { success: true, ...data };
  }

  @ApiOperation({ summary: 'Create new ecosystem' })
  @Post('create')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  async createEcosystem(@Body() body: any, @CurrentUser() user: any) {
    const data = await this.commandBus.execute(
      new CreateEcosystemCommand(user.id, body)
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get ecosystem audit logs' })
  @Get('audit')
  async getAuditLogs(@CurrentUser() user: any) {
    const data = await this.queryBus.execute(
      new GetEcosystemAuditLogsQuery(user.id)
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Add member to ecosystem' })
  @Post('members')
  async addMember(
    @Body() body: { memberVendorId: string },
    @CurrentUser() user: any
  ) {
    return this.commandBus.execute(
      new AddEcosystemMemberCommand(user.id, body.memberVendorId)
    );
  }
}
