// apps/backend/src/modules/content/application/commands/content-misc.handlers.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateAnnouncementCommand } from './create-announcement.command';
import { CreatePolicyCommand } from './create-policy.command';
import { CreateDynamicContentCommand } from './create-dynamic-content.command';
import { UpsertSeoMetadataCommand } from './upsert-seo-metadata.command';
import { IAnnouncementRepository } from '../../domain/repositories/announcement.repository.interface';
import { IPolicyRepository } from '../../domain/repositories/policy.repository.interface';
import { IDynamicContentRepository } from '../../domain/repositories/dynamic-content.repository.interface';
import { ISeoMetadataRepository } from '../../domain/repositories/seo-metadata.repository.interface';
import { Announcement } from '../../domain/entities/announcement.entity';
import { Policy } from '../../domain/entities/policy.entity';
import { DynamicContent } from '../../domain/entities/dynamic-content.entity';
import { SeoMetadata } from '../../domain/entities/seo-metadata.entity';
import { Slug } from '../../domain/value-objects/slug.vo';

@CommandHandler(CreateAnnouncementCommand)
export class CreateAnnouncementHandler implements ICommandHandler<CreateAnnouncementCommand> {
  constructor(@Inject('IAnnouncementRepository') private readonly repository: IAnnouncementRepository) {}
  async execute(command: CreateAnnouncementCommand) {
    const announcement = Announcement.create({
      ...command.dto,
      startDate: new Date(command.dto.startDate),
      endDate: command.dto.endDate ? new Date(command.dto.endDate) : undefined,
    });
    await this.repository.save(announcement);
    return { id: announcement.id.toString() };
  }
}

@CommandHandler(CreatePolicyCommand)
export class CreatePolicyHandler implements ICommandHandler<CreatePolicyCommand> {
  constructor(@Inject('IPolicyRepository') private readonly repository: IPolicyRepository) {}
  async execute(command: CreatePolicyCommand) {
    const result = Slug.create(command.dto.title);
    if (!result.success) throw result.error;
    const slug = result.data;
    const policy = Policy.create({ ...command.dto, slug: slug.value });
    await this.repository.save(policy);
    return { id: policy.id.toString(), slug: slug.value };
  }
}

@CommandHandler(CreateDynamicContentCommand)
export class CreateDynamicContentHandler implements ICommandHandler<CreateDynamicContentCommand> {
  constructor(@Inject('IDynamicContentRepository') private readonly repository: IDynamicContentRepository) {}
  async execute(command: CreateDynamicContentCommand) {
    const content = DynamicContent.create(command.dto);
    await this.repository.save(content);
    return { id: content.id.toString() };
  }
}

@CommandHandler(UpsertSeoMetadataCommand)
export class UpsertSeoMetadataHandler implements ICommandHandler<UpsertSeoMetadataCommand> {
  constructor(@Inject('ISeoMetadataRepository') private readonly repository: ISeoMetadataRepository) {}
  async execute(command: UpsertSeoMetadataCommand) {
    const { dto } = command;
    let metadata = await this.repository.findByPath(dto.path, dto.platform);
    if (metadata) {
      metadata.update(dto);
      await this.repository.save(metadata);
    } else {
      metadata = SeoMetadata.create(dto);
      await this.repository.save(metadata);
    }
    return { id: metadata.id.toString() };
  }
}
