// apps/backend/src/modules/vendor/application/commands/create-company.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCompanyCommand } from './create-company.command';
import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';
import { TaxNumber } from '../../domain/value-objects/tax-number.vo';
import { Company } from '../../domain/entities/company.entity';
import { ConflictException } from '@barterborsa/shared-core';
import { isErr } from '@barterborsa/shared-core';
import { Inject } from '@nestjs/common';

@CommandHandler(CreateCompanyCommand)
export class CreateCompanyHandler implements ICommandHandler<CreateCompanyCommand> {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(command: CreateCompanyCommand): Promise<string> {
    const { dto } = command;

    const taxNumberResult = TaxNumber.create(dto.taxNumber);
    if (!taxNumberResult.success) {
      throw taxNumberResult.error;
    }

    const taxNumber = taxNumberResult.data;

    const exists = await this.companyRepository.existsByTaxNumber(taxNumber);
    if (exists) {
      throw new ConflictException('Bu vergi numarası ile kayıtlı bir şirket zaten mevcut.');
    }

    const company = Company.create({
      taxNumber: taxNumber,
      name: dto.name,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
      website: dto.website,
      registrationNumber: dto.registrationNumber,
      taxOffice: dto.taxOffice,
      representativeName: dto.representativeName,
      representativePhone: dto.representativePhone,
      companyType: dto.companyType,
      tradeRegistryNumber: dto.tradeRegistryNumber,
      mersisNumber: dto.mersisNumber,
      kepAddress: dto.kepAddress,
      vatRate: dto.vatRate,
    });

    await this.companyRepository.save(company);

    return company.id;
  }
}
