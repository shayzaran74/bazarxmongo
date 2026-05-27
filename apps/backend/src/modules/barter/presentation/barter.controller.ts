// apps/backend/src/modules/barter/presentation/barter.controller.ts
// /api/barter/* — barter cüzdan ve genel barter bilgisi

import {
  Controller, Get, Post, Body, UseGuards,
  BadRequestException, Inject, Logger,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { GetBarterInfoQuery } from '../application/queries/get-barter-info.query';
import { GetMyBarterChainsQuery } from '../application/queries/get-my-barter-chains.query';
import { GetMyBarterOffersQuery } from '../application/queries/get-my-barter-offers.query';
import { RegisterBarterCommand } from '../application/commands/register-barter.command';
import { FinancialGatewayService } from '../../financial-gateway/financial-gateway.service';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';
import { ICompany } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { BarterTopupDto, BarterWithdrawDto, BarterTransferDto } from './dto/barter-wallet.dto';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
}

interface IVendorLean { id: string; userId: string; }

@ApiTags('Barter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
@Controller('barter')
export class BarterController {
  private readonly logger = new Logger(BarterController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly financialGateway: FinancialGatewayService,
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @InjectModel('Company') private readonly companyModel: Model<ICompany>,
  ) {}

  // ─── Barter bilgisi ───────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Barter hesap bilgisi' })
  @Get('info')
  async getInfo(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetBarterInfoQuery(user.id));
    return { success: true, data };
  }

  // ─── Zincirler (swap sessions) ────────────────────────────────────────────

  @ApiOperation({ summary: 'Benim takas zincirlerim' })
  @Get('my-chains')
  async getMyChains(@CurrentUser() user: AuthenticatedUser) {
    const sessions = await this.queryBus.execute(new GetMyBarterChainsQuery(user.id));
    return { success: true, data: sessions };
  }

  // ─── Teklifler ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Benim tekliflerim' })
  @Get('my-offers')
  async getMyOffers(@CurrentUser() user: AuthenticatedUser) {
    const offers = await this.queryBus.execute(new GetMyBarterOffersQuery(user.id));
    return { success: true, data: offers };
  }

  // ─── Barter kaydı ────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Barter sistemine kayıt' })
  @ApiResponse({ status: 201 })
  @Post('register')
  async register(@CurrentUser() user: AuthenticatedUser) {
    return this.commandBus.execute(new RegisterBarterCommand(user.id));
  }

  // ─── Cüzdan işlemleri ─────────────────────────────────────────────────────
  // Not: Gerçek ödeme financial-gateway üzerinden yapılır.
  // Bu endpoint'ler FinancialGatewayService'e bağlanmalı — şimdilik stub.

  @ApiOperation({ summary: 'Barter cüzdanına para yükle' })
  @Post('topup')
  async topup(@CurrentUser() user: AuthenticatedUser, @Body() body: BarterTopupDto) {
    return this.financialGateway.transferBetweenAccounts({
      userId: user.id,
      fromAccountType: 'MAIN',
      toAccountType: 'BARTER',
      amount: body.amount.toString(),
      note: 'Barter havuzuna bakiye aktarımı',
    });
  }

  @ApiOperation({ summary: 'Barter cüzdanından para çek' })
  @Post('withdraw')
  async withdraw(@CurrentUser() user: AuthenticatedUser, @Body() body: BarterWithdrawDto) {
    return this.financialGateway.transferBetweenAccounts({
      userId: user.id,
      fromAccountType: 'BARTER',
      toAccountType: 'MAIN',
      amount: body.amount.toString(),
      note: 'Barter havuzundan nakit iadesi',
    });
  }

  @ApiOperation({ summary: 'Barter transferi başlat' })
  @Post('transfer')
  async transfer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: BarterTransferDto,
  ): Promise<{ success: boolean; data?: { transferId: string; holdId: string; amount: number; toCompanyId: string; status: string }; message?: string }> {
    // Alıcı firma → vendor → userId çözümlemesi
    const receiverCompany = await this.companyModel
      .findOne({ id: body.toCompanyId })
      .select('id vendorId')
      .lean()
      .exec();

    if (!receiverCompany?.vendorId) {
      throw new BadRequestException('Alıcı firma bulunamadı veya vendor kaydı yok');
    }

    const receiverVendor = await this.vendorRepository.findById(receiverCompany.vendorId) as IVendorLean | null;
    if (!receiverVendor?.userId) {
      throw new BadRequestException('Alıcı firmanın kullanıcı kaydı bulunamadı');
    }

    const transferId    = randomUUID();
    const idempotencyHold    = `barter-transfer-hold-${transferId}`;
    const idempotencyRelease = `barter-transfer-release-${transferId}`;

    // 1. Göndericinin BARTER hesabından blokaj al — alıcı sellerId olarak atanır
    const holdResult = await this.financialGateway.holdFunds(
      user.id,
      body.amount.toString(),
      'BARTER_TRANSFER',
      transferId,
      'BARTER_TRANSFER',
      idempotencyHold,
      receiverVendor.userId,
    );

    const holdId = (holdResult as { holdId?: string })?.holdId;
    if (!holdId) {
      throw new BadRequestException('Teminat blokajı oluşturulamadı');
    }

    // 2. Blokajı hemen alıcıya serbest bırak (P2P transfer tamamlanır)
    await this.financialGateway.releaseFunds(holdId, idempotencyRelease);

    this.logger.log('Barter transferi tamamlandı', {
      transferId,
      fromUserId: user.id,
      toUserId: receiverVendor.userId,
      amount: body.amount,
    });

    return {
      success: true,
      data: {
        transferId,
        holdId,
        amount:      body.amount,
        toCompanyId: body.toCompanyId,
        status:      'COMPLETED',
      },
    };
  }
}

