// apps/backend/src/modules/catalog/application/commands/create-category.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from './create-category.command';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { Slug } from '../../domain/value-objects/slug.vo';
import { ConflictException, isErr } from '@barterborsa/shared-core';
import { Inject } from '@nestjs/common';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<string> {
    const { dto } = command;

    const slugResult = Slug.create(dto.slug);
    if (!slugResult.success) {
      throw slugResult.error;
    }

    const existing = await this.categoryRepository.findBySlug(slugResult.data);
    if (existing) {
      throw new ConflictException('Bu slug ile bir kategori zaten mevcut.');
    }

    const category = Category.create({
      name: dto.name,
      slug: slugResult.data,
      parentId: dto.parentId,
      description: dto.description,
      icon: dto.icon,
      image: dto.image,
      type: dto.type,
      badgeText: dto.badgeText,
      badgeColor: dto.badgeColor,
    });

    await this.categoryRepository.save(category);

    return category.id;
  }
}
