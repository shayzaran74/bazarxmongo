// apps/backend/src/modules/content/application/commands/create-help.handlers.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateHelpCategoryCommand } from './create-help-category.command';
import { CreateHelpArticleCommand } from './create-help-article.command';
import { IHelpCategoryRepository } from '../../domain/repositories/help-category.repository.interface';
import { IHelpArticleRepository } from '../../domain/repositories/help-article.repository.interface';
import { HelpCategory } from '../../domain/entities/help-category.entity';
import { HelpArticle } from '../../domain/entities/help-article.entity';
import { Slug } from '../../domain/value-objects/slug.vo';

@CommandHandler(CreateHelpCategoryCommand)
export class CreateHelpCategoryHandler implements ICommandHandler<CreateHelpCategoryCommand> {
  constructor(
    @Inject('IHelpCategoryRepository') private readonly repository: IHelpCategoryRepository,
  ) {}

  async execute(command: CreateHelpCategoryCommand) {
    const { dto } = command;
    const result = Slug.create(dto.name);
    if (!result.success) throw result.error;
    const slug = result.data;

    const category = HelpCategory.create({
      ...dto,
      slug: slug.value,
    });

    await this.repository.save(category);
    return { id: category.id.toString(), slug: slug.value };
  }
}

@CommandHandler(CreateHelpArticleCommand)
export class CreateHelpArticleHandler implements ICommandHandler<CreateHelpArticleCommand> {
  constructor(
    @Inject('IHelpArticleRepository') private readonly repository: IHelpArticleRepository,
  ) {}

  async execute(command: CreateHelpArticleCommand) {
    const { dto } = command;
    const result = Slug.create(dto.title);
    if (!result.success) throw result.error;
    const slug = result.data;

    const article = HelpArticle.create({
      ...dto,
      slug: slug.value,
    });

    await this.repository.save(article);
    return { id: article.id.toString(), slug: slug.value };
  }
}
