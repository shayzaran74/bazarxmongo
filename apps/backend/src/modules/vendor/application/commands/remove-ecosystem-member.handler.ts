// apps/backend/src/modules/vendor/application/commands/remove-ecosystem-member.handler.ts

import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { RemoveEcosystemMemberCommand } from './remove-ecosystem-member.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IBrandEcosystemRepository } from '../../domain/repositories/brand-ecosystem.repository.interface';
import { MongoEcosystemAuditLogRepository } from '../../infrastructure/persistence/mongo-ecosystem-audit-log.repository';
import { IEcosystemMembershipRepository } from '../../domain/repositories/i-ecosystem-membership.repository';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { EcosystemMemberRemovedEvent } from '../../domain/events/ecosystem-member-removed.event';

@CommandHandler(RemoveEcosystemMemberCommand)
export class RemoveEcosystemMemberHandler implements ICommandHandler<RemoveEcosystemMemberCommand> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IBrandEcosystemRepository') private readonly ecosystemRepo: IBrandEcosystemRepository,
    @Inject('IEcosystemMembershipRepository')
    private readonly membershipRepo: IEcosystemMembershipRepository,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
    private readonly auditLog: AuditLogService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RemoveEcosystemMemberCommand) {
    const { userId, memberVendorId, ecosystemId } = command;

    const callerVendor = await this.vendorRepo.findByUserId(userId);
    if (!callerVendor) throw new ForbiddenException('Satıcı profiliniz bulunamadı.');

    const memberVendor = await this.vendorRepo.findById(memberVendorId);
    if (!memberVendor) throw new NotFoundException('Üye bayi bulunamadı.');

    // Ecosistemin sahibi mi kontrol et
    const ecosystem = await this.ecosystemRepo.findById(ecosystemId);
    if (!ecosystem) throw new NotFoundException('Ekosistem bulunamadı.');
    if (ecosystem.ownerId !== callerVendor.id) {
      throw new ForbiddenException('Bu ekosistemen üyesini çıkarma yetkiniz yok.');
    }

    // Membership kaydını bul
    const membership = await this.membershipRepo.findOne(memberVendorId, ecosystemId);
    if (!membership || membership.status === 'REMOVED') {
      throw new BadRequestException('Bu bayi bu ekosistemin üyesi değil.');
    }

    // Status'u REMOVED yap
    const now = new Date();
    await this.membershipRepo.updateStatus(memberVendorId, ecosystemId, 'REMOVED', now);

    // AuditLog yaz
    await this.auditLog.log({
      actorId: userId,
      action: 'MEMBER_REMOVED',
      resourceType: 'EcosystemMembership',
      resourceId: `${memberVendorId}-${ecosystemId}`,
      newValue: {
        memberVendorId,
        removedAt: now,
        removedBy: userId,
        ecosystemId,
      },
    });

    // Domain event — BazarX publish'i kaldır
    const removedEvent = new EcosystemMemberRemovedEvent(memberVendorId, ecosystemId);
    await this.eventBus.publish(removedEvent);

    return { success: true };
  }
}