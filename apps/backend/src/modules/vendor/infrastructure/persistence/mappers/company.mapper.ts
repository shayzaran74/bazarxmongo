// apps/backend/src/modules/vendor/infrastructure/persistence/mappers/company.mapper.ts
// CompanyMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { ICompany } from '../../../../../../../../packages/shared/shared-persistence/src/schemas/backend/company.schema';
import { Company, CompanyProps } from '../../../domain/entities/company.entity';
import { TaxNumber } from '../../../domain/value-objects/tax-number.vo';

export interface CompanyDocument extends ICompany {
  _id?: string;
}

export class CompanyMapper {
  public static toDomain(doc: CompanyDocument): Company {
    let taxNumber = undefined;
    if (doc.taxNumber) {
      const taxNumberResult = TaxNumber.create(doc.taxNumber);
      if (taxNumberResult.success) {
        taxNumber = taxNumberResult.data;
      }
    }

    const props: CompanyProps = {
      vendorId: doc.vendorId,
      taxNumber,
      name: doc.name,
      address: doc.address,
      phone: doc.phone,
      email: doc.email,
      website: doc.website,
      logo: doc.logo,
      registrationNumber: doc.registrationNumber,
      taxOffice: doc.taxOffice,
      representativeName: doc.representativeName,
      representativePhone: doc.representativePhone,
      vatRate: doc.vatRate ? Number(doc.vatRate.toString()) : 0,
      status: doc.status,
      companyType: doc.companyType,
      tradeRegistryNumber: doc.tradeRegistryNumber,
      mersisNumber: doc.mersisNumber,
      kepAddress: doc.kepAddress,
      verifiedAt: doc.verifiedAt,
      deletedAt: doc.deletedAt,
    };

    return Company.fromPersistence(props, doc.id);
  }

  public static toPersistence(company: Company): Record<string, unknown> {
    const props = company.getProps();
    return {
      _id: company.id,
      id: company.id,
      vendorId: props.vendorId,
      taxNumber: props.taxNumber?.value,
      name: props.name,
      address: props.address,
      phone: props.phone,
      email: props.email,
      website: props.website,
      logo: props.logo,
      registrationNumber: props.registrationNumber,
      taxOffice: props.taxOffice,
      representativeName: props.representativeName,
      representativePhone: props.representativePhone,
      vatRate: props.vatRate,
      status: props.status,
      companyType: props.companyType,
      tradeRegistryNumber: props.tradeRegistryNumber,
      mersisNumber: props.mersisNumber,
      kepAddress: props.kepAddress,
      verifiedAt: props.verifiedAt,
      deletedAt: props.deletedAt,
    };
  }
}