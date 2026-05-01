// apps/backend/src/modules/vendor/presentation/ecosystem.controller.ts

import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';

import { GetMyEcosystemQuery } from '../application/queries/get-my-ecosystem.query';
import { GetEcosystemAuditLogsQuery } from '../application/queries/get-ecosystem-audit-logs.query';
import { CreateEcosystemCommand } from '../application/commands/create-ecosystem.command';
import { AddEcosystemMemberCommand } from '../application/commands/add-ecosystem-member.command';
import { RemoveEcosystemMemberCommand } from '../application/commands/remove-ecosystem-member.command';
import { UpdateEcosystemSettingsCommand } from '../application/commands/update-ecosystem-settings.command';
import { CreateEcosystemDto } from '../application/dtos/create-ecosystem.dto';
import { UpdateEcosystemSettingsDto } from '../application/dtos/update-ecosystem-settings.dto';

interface AuthenticatedUser {
  id: string;
  role: string;
}

@ApiTags('Ecosystem')
@ApiBearerAuth()
@Controller('ecosystem')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EcosystemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Ekosistem durumumu getir' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('my')
  async getMyEcosystem(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetMyEcosystemQuery(user.id));
    if (!data) return { success: false, message: 'Vendor bulunamadı' };
    return { success: true, ...data };
  }

  @ApiOperation({ summary: 'Yeni ekosistem kur' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Post('create')
  async createEcosystem(
    @Body() dto: CreateEcosystemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.commandBus.execute(
      new CreateEcosystemCommand(user.id, { name: dto.name, description: dto.description }),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Ekosistem ayarlarını güncelle (isBlindPool, internalCommRate)' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Patch('settings')
  async updateSettings(
    @Body() dto: UpdateEcosystemSettingsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new UpdateEcosystemSettingsCommand(user.id, {
        isBlindPool: dto.isBlindPool,
        internalCommRate: dto.internalCommRate,
      }),
    );
  }

  @ApiOperation({ summary: 'Ekosistem denetim logları' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('audit')
  async getAuditLogs(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetEcosystemAuditLogsQuery(user.id));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Ekosisteme üye ekle' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Post('members')
  async addMember(
    @Body() body: { memberVendorId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new AddEcosystemMemberCommand(user.id, body.memberVendorId),
    );
  }

  @ApiOperation({ summary: 'Ekosistemden üye çıkar' })
  @ApiParam({ name: 'vendorId', description: 'Çıkarılacak bayi ID' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Delete('members/:vendorId')
  async removeMember(
    @Param('vendorId') memberVendorId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new RemoveEcosystemMemberCommand(user.id, memberVendorId),
    );
  }
}
