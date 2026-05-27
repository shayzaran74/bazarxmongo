import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetBrandsQuery } from './get-brands.query';
import { IBrandRepository } from '../../../domain/repositories/brand.repository.interface';

@QueryHandler(GetBrandsQuery)
export class GetBrandsHandler implements IQueryHandler<GetBrandsQuery> {

  constructor(
    @Inject('IBrandRepository') private readonly brandRepository: IBrandRepository,
  ) {}

  async execute(query: GetBrandsQuery) {
    return this.brandRepository.findApproved(query.limit);
  }
}