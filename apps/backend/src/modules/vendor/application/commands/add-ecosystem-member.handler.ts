// apps/backend/src/modules/vendor/application/commands/add-ecosystem-member.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { AddEcosystemMemberCommand } from './add-ecosystem-member.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IBrandEcosystemRepository } from '../../domain/repositories/brand-ecosystem.repository.interface';
import { MongoEcosystemAuditLogRepository } from '../../infrastructure/persistence/mongo-ecosystem-audit-log.repository';
import { IEcosystemMembershipRepository } from '../../domain/repositories/i-ecosystem-membership.repository';
import { ECOSYSTEM_MEMBERSHIP_LIMITS, TIER_UPGRADE_MAP } from '../../domain/constants/ecosystem.constants';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(AddEcosystemMemberCommand)
export class AddEcosystemMemberHandler implements ICommandHandler<AddEcosystemMemberCommand> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IBrandEcosystemRepository') private readonly ecosystemRepo: IBrandEcosystemRepository,
    @Inject('IEcosystemMembershipRepository')
    private readonly membershipRepo: IEcosystemMembershipRepository,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: AddEcosystemMemberCommand) {
    const { userId, memberVendorId, ecosystemId } = command;

    // 1. Ecosystem'i bul
    const ecosystem = await this.ecosystemRepo.findById(ecosystemId);
    if (!ecosystem) throw new NotFoundException('Ekosistem bulunamadı.');

    // 2. Actor vendor'ı bul — ecosystem'in owner'ı mı kontrol et
    const actorVendor = await this.vendorRepo.findByUserId(userId);
    if (!actorVendor) throw new NotFoundException('Satıcı profiliniz bulunamadı.');
    if (ecosystem.ownerId !== actorVendor.id) {
      throw new ForbiddenException('Bu ekosisteme üye ekleme yetkiniz yok.');
    }

    // 2b. Üye limiti kontrolü (pre-check — kesin kontrol create anında unique index ile)
    const currentMembers = await this.membershipRepo.findByEcosystemId(ecosystemId);
    const activeCount = currentMembers.filter(m => m.status === 'ACTIVE').length;
    const maxMembers = (ecosystem as unknown as { maxMembers?: number }).maxMembers ?? 50;
    if (activeCount >= maxMembers) {
      throw new BadRequestException(
        `Ekosistem üye limiti doldu (${maxMembers}). Daha fazla üye eklemek için limitinizi yükseltmeniz gerekiyor.`,
      );
    }
    // Not: Unique compound index (dealerId+ecosystemId) duplicate üyeliği DB seviyesinde engeller.
    // Limit kontrolü pre-check — son derece yüksek concurrent durumda 1 fazla üye olabilir ama duplicate olmaz.

    // 3. Eklenecek member vendor'ı bul
    const memberVendor = await this.vendorRepo.findById(memberVendorId);
    if (!memberVendor) throw new NotFoundException('Bayi bulunamadı.');
    if (!memberVendor.isActive()) {
      throw new BadRequestException('Sadece onaylanmış (APPROVED) bayiler ekosisteme eklenebilir.');
    }

    // 4. APEX tier kontrolü — APEX vendor başkasının ekosistemine üye olamaz
    if (memberVendor.tier === 'APEX') {
      throw new ForbiddenException({
        code: 'APEX_CANNOT_JOIN',
        message: 'APEX tier bayi başka bir ekosisteme üye olamaz.',
      });
    }

    // 5. Zaten üye mi kontrol et
    const existing = await this.membershipRepo.findOne(memberVendorId, ecosystemId);
    if (existing) {
      if (existing.status === 'ACTIVE') {
        throw new ConflictException({
          code: 'ALREADY_MEMBER',
          message: 'Bu bayi zaten bu ekosistemin aktif üyesidir.',
        });
      }
      if (existing.status === 'SUSPENDED') {
        throw new BadRequestException({
          code: 'MEMBER_SUSPENDED',
          message: 'Bu bayi askıya alınmış durumda. Üyelik aktifleştirilemez.',
        });
      }
      // REMOVED → yeniden aktifleştir
      await this.membershipRepo.updateStatus(memberVendorId, ecosystemId, 'ACTIVE', new Date());
      const count = await this.membershipRepo.countActiveByDealerId(memberVendorId);
      await this.auditLog.log({
        actorId: userId,
        action: 'MEMBER_REACTIVATED',
        resourceType: 'EcosystemMembership',
        resourceId: `${memberVendorId}-${ecosystemId}`,
        newValue: { memberVendorId, memberTier: memberVendor.tier, ecosystemId, membershipCount: count },
      });
      return { success: true, reactivated: true };
    }

    // 6. Kota kontrolü (atomic transaction içinde)
    const limit = ECOSYSTEM_MEMBERSHIP_LIMITS[memberVendor.tier] ?? 0;
    if (limit === 0) {
      throw new ForbiddenException({
        code: 'ECOSYSTEM_MEMBERSHIP_LIMIT_REACHED',
        message: `${memberVendor.tier} tier bayi başka ekosisteme üye olamaz.`,
        tier: memberVendor.tier,
        currentCount: 0,
        limit: 0,
        upgradeRequired: TIER_UPGRADE_MAP[memberVendor.tier],
      });
    }

    const currentCount = await this.membershipRepo.countActiveByDealerId(memberVendorId);
    if (currentCount >= limit) {
      throw new ForbiddenException({
        code: 'ECOSYSTEM_MEMBERSHIP_LIMIT_REACHED',
        currentCount,
        limit,
        tier: memberVendor.tier,
        upgradeRequired: TIER_UPGRADE_MAP[memberVendor.tier],
      });
    }

    // 7. EcosystemMembership kaydı oluştur (unique index ile race condition korumalı)
    let membership: { id: string; dealerId: string; ecosystemId: string; status: string; joinedAt: Date };
    try {
      membership = await this.membershipRepo.create({
        dealerId: memberVendorId,
        ecosystemId,
        addedByUserId: userId,
      });
    } catch (err: unknown) {
      const mongoErr = err as { code?: number };
      if (mongoErr.code === 11000) {
        throw new ConflictException('Bu bayi zaten bu ekosisteme kayıtlı (eşzamanlı istek algılandı).');
      }
      throw err;
    }

    // 8. AuditLog yaz
    await this.auditLog.log({
      actorId: userId,
      action: 'MEMBER_ADDED',
      resourceType: 'EcosystemMembership',
      resourceId: membership.id,
      newValue: {
        memberId: memberVendorId,
        memberTier: memberVendor.tier,
        membershipCount: currentCount + 1,
        limit,
        ecosystemId,
      },
    });

    return { success: true, membershipId: membership.id };
  }
}