import { Command } from '@barterborsa/shared-core';
import { CreateCatalogProductDto } from '../dtos/create-catalog-product.dto';

export class CreateCatalogProductCommand extends Command {
  constructor(public readonly dto: CreateCatalogProductDto) {
    super();
  }
}
