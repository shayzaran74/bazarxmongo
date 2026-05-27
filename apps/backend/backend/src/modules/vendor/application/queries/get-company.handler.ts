// apps/backend/src/modules/vendor/application/queries/get-company.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCompanyQuery } from './get-company.query';
import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';
import { NotFoundException } from '@barterborsa/shared-core';
import { Inject } from '@nestjs/common';

@QueryHandler(GetCompanyQuery)
export class GetCompanyHandler implements IQueryHandler<GetCompanyQuery> {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(query: GetCompanyQuery): Promise<any> {
    const company = await this.companyRepository.findById(query.id);
    if (!company) {
      throw new NotFoundException('Şirket bulunamadı.');
    }

    const props = company.getProps();
    return {
      id: company.id,
      name: props.name,
      taxNumber: props.taxNumber?.value || null,
      status: props.status,
    };
  }
}
