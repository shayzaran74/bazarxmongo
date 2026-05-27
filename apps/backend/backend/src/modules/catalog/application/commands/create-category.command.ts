// apps/backend/src/modules/catalog/application/commands/create-category.command.ts

import { Command } from '@barterborsa/shared-core';
import { CreateCategoryDto } from '../dtos/create-category.dto';

export class CreateCategoryCommand extends Command {
  constructor(public readonly dto: CreateCategoryDto) {
    super();
  }
}
