import { Command } from '@barterborsa/shared-core';
import { CreateHomeBannerDto } from '../dtos/create-home-banner.dto';
import { CreateQuadCardDto } from '../dtos/create-quad-card.dto';
import { CreateHelpCategoryDto, CreateHelpArticleDto } from '../dtos/create-help.dtos';
import { CreateAnnouncementDto, CreatePolicyDto, CreateDynamicContentDto, UpsertSeoMetadataDto } from '../dtos/content-misc.dtos';

export class CreateHelpCategoryCommand extends Command {
  constructor(public readonly dto: CreateHelpCategoryDto) { super(); }
}
