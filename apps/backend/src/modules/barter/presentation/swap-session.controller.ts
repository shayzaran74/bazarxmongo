// apps/backend/src/modules/barter/presentation/swap-session.controller.ts

import {
  Controller, Get, Post, Body, Param,
  UseGuards, NotFoundException, ForbiddenException, Inject,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { SubmitShippingCommand } from '../application/commands/submit-shipping.command';
import { ConfirmReceiptCommand } from '../application/commands/confirm-receipt.command';
import { FinalizeSwapCommand } from '../application/commands/finalize-swap.command';
import { OpenDisputeCommand } from '../application/commands/open-dispute.command';
import { ResolveDisputeCommand } from '../application/commands/resolve-dispute.command';
import { SwapShippingDto } from './dto/swap-shipping.dto';
import { SwapDisputeDto } from './dto/swap-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { Patch } from '@nestjs/common';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';
import { ISwapSessionRepository } from '../domain/repositories/swap-session.repository.interface';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
}

@ApiTags('Swap Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('barter/swap')
export class SwapSessionController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @Inject('ISwapSessionRepository') private readonly swapSessionRepository: ISwapSessionRepository,
  ) {}

  @ApiOperation({ summary: 'Swap session detayını getir' })
  @ApiParam({ name: 'id', description: 'SwapSession ID' })
  @Get(':id')
  async getSession(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const companyId = await this.resolveCompanyId(user);

    const session = await this.swapSessionRepository.findByIdWithRelations(id);

    if (!session) throw new NotFoundException('Swap session bulunamadı.');

    if (session.initiatorId !== companyId && session.receiverId !== companyId) {
      throw new ForbiddenException('Bu swap session\'a erişim yetkiniz yok.');
    }

    return { success: true, data: session };
  }

  @ApiOperation({ summary: 'Kargo bilgisi gönder' })
  @ApiParam({ name: 'id' })
  @Post(':id/ship')
  async submitShipping(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SwapShippingDto,
  ) {
    const companyId = await this.resolveCompanyId(user);
    return this.commandBus.execute(
      new SubmitShippingCommand(id, user.id, companyId, dto.trackingCode, dto.carrier),
    );
  }

  @ApiOperation({ summary: 'Teslimat al — ürünü teslim aldım' })
  @ApiParam({ name: 'id' })
  @Post(':id/confirm')
  async confirmReceipt(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const companyId = await this.resolveCompanyId(user);
    return this.commandBus.execute(new ConfirmReceiptCommand(id, user.id, companyId));
  }

  @ApiOperation({ summary: 'Swap\'ı sonlandır ve teminatları serbest bırak' })
  @ApiParam({ name: 'id' })
  @Post(':id/finalize')
  async finalizeSwap(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const companyId = await this.resolveCompanyId(user);
    return this.commandBus.execute(new FinalizeSwapCommand(id, user.id, companyId));
  }

  @ApiOperation({ summary: 'Anlaşmazlık bildir' })
  @ApiParam({ name: 'id' })
  @Post(':id/dispute')
  async openDispute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SwapDisputeDto,
  ) {
    const companyId = await this.resolveCompanyId(user);
    return this.commandBus.execute(new OpenDisputeCommand(id, user.id, companyId, dto.reason));
  }

  @ApiOperation({ summary: 'Anlaşmazlığı çözümle (Sadece Admin)' })
  @ApiParam({ name: 'id' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  @Patch(':id/resolve')
  async resolveDispute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.commandBus.execute(
      new ResolveDisputeCommand(id, user.id, dto.result, dto.adminNote),
    );
  }

  // ─── Yardımcı ─────────────────────────────────────────────────────────────

  private async resolveCompanyId(user: AuthenticatedUser): Promise<string> {
    const vendor = await this.vendorRepository.findByUserId(user.id);
    if (!vendor) throw new ForbiddenException('Satıcı profiliniz bulunamadı.');
    if (vendor.getProps().status !== 'APPROVED') {
      throw new ForbiddenException('Satıcı hesabınız onaylanmamış.');
    }
    const companyId = vendor.getProps().companyId;
    if (!companyId) throw new ForbiddenException('Şirket kaydınız bulunamadı. Lütfen şirket profilinizi tamamlayın.');
    return companyId;
  }
}