// apps/backend/src/modules/content/application/commands/create-content.commands.ts

import { Command } from '@barterborsa/shared-core';
import { CreateHomeBannerDto } from '../dtos/create-home-banner.dto';
import { CreateQuadCardDto } from '../dtos/create-quad-card.dto';
import { CreateHelpCategoryDto, CreateHelpArticleDto } from '../dtos/create-help.dtos';
import { CreateAnnouncementDto, CreatePolicyDto, CreateDynamicContentDto, UpsertSeoMetadataDto } from '../dtos/content-misc.dtos';

export class CreateHomeBannerCommand extends Command {
  constructor(public readonly dto: CreateHomeBannerDto) { super(); }
}

export class CreateQuadCardCommand extends Command {
  constructor(public readonly dto: CreateQuadCardDto) { super(); }
}

export class CreateHelpCategoryCommand extends Command {
  constructor(public readonly dto: CreateHelpCategoryDto) { super(); }
}

export class CreateHelpArticleCommand extends Command {
  constructor(public readonly dto: CreateHelpArticleDto) { super(); }
}

export class CreateAnnouncementCommand extends Command {
  constructor(public readonly dto: CreateAnnouncementDto) { super(); }
}

export class CreatePolicyCommand extends Command {
  constructor(public readonly dto: CreatePolicyDto) { super(); }
}

export class CreateDynamicContentCommand extends Command {
  constructor(public readonly dto: CreateDynamicContentDto) { super(); }
}

export class UpsertSeoMetadataCommand extends Command {
  constructor(public readonly dto: UpsertSeoMetadataDto) { super(); }
}
