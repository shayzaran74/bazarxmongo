// apps/backend/src/modules/content/application/commands/content-misc.handlers.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as cmd from './create-content.commands';
import { IAnnouncementRepository } from '../../domain/repositories/announcement.repository.interface';
import { IPolicyRepository } from '../../domain/repositories/policy.repository.interface';
import { IDynamicContentRepository } from '../../domain/repositories/dynamic-content.repository.interface';
import { ISeoMetadataRepository } from '../../domain/repositories/seo-metadata.repository.interface';
import { Announcement } from '../../domain/entities/announcement.entity';
import { Policy } from '../../domain/entities/policy.entity';
import { DynamicContent } from '../../domain/entities/dynamic-content.entity';
import { SeoMetadata } from '../../domain/entities/seo-metadata.entity';
import { Slug } from '../../domain/value-objects/slug.vo';

@CommandHandler(cmd.CreateAnnouncementCommand)
export class CreateAnnouncementHandler implements ICommandHandler<cmd.CreateAnnouncementCommand> {
  constructor(@Inject('IAnnouncementRepository') private readonly repository: IAnnouncementRepository) {}
  async execute(command: cmd.CreateAnnouncementCommand) {
    const announcement = Announcement.create({
      ...command.dto,
      startDate: new Date(command.dto.startDate),
      endDate: command.dto.endDate ? new Date(command.dto.endDate) : undefined,
    });
    await this.repository.save(announcement);
    return { id: announcement.id.toString() };
  }
}

@CommandHandler(cmd.CreatePolicyCommand)
export class CreatePolicyHandler implements ICommandHandler<cmd.CreatePolicyCommand> {
  constructor(@Inject('IPolicyRepository') private readonly repository: IPolicyRepository) {}
  async execute(command: cmd.CreatePolicyCommand) {
    const result = Slug.create(command.dto.title);
    if (!result.success) throw result.error;
    const slug = result.data;
    
    const policy = Policy.create({ ...command.dto, slug: slug.value });
    await this.repository.save(policy);
    return { id: policy.id.toString(), slug: slug.value };
  }
}

@CommandHandler(cmd.CreateDynamicContentCommand)
export class CreateDynamicContentHandler implements ICommandHandler<cmd.CreateDynamicContentCommand> {
  constructor(@Inject('IDynamicContentRepository') private readonly repository: IDynamicContentRepository) {}
  async execute(command: cmd.CreateDynamicContentCommand) {
    const content = DynamicContent.create(command.dto);
    await this.repository.save(content);
    return { id: content.id.toString() };
  }
}

@CommandHandler(cmd.UpsertSeoMetadataCommand)
export class UpsertSeoMetadataHandler implements ICommandHandler<cmd.UpsertSeoMetadataCommand> {
  constructor(@Inject('ISeoMetadataRepository') private readonly repository: ISeoMetadataRepository) {}
  async execute(command: cmd.UpsertSeoMetadataCommand) {
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
