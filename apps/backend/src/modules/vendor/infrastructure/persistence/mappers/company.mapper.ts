// apps/backend/src/modules/vendor/infrastructure/persistence/mappers/company.mapper.ts

import { Company, CompanyProps } from '../../../domain/entities/company.entity';
import { TaxNumber } from '../../../domain/value-objects/tax-number.vo';

export class CompanyMapper {
  public static toDomain(record: any): Company {
    let taxNumber = undefined;
    if (record.taxNumber) {
      const taxNumberResult = TaxNumber.create(record.taxNumber);
      if (taxNumberResult.success) {
        taxNumber = taxNumberResult.data;
      } else {
        console.warn(`Invalid tax number in DB for company ${record.id}: ${record.taxNumber}`);
        // Domain modelini bozmamak için null/undefined geçiyoruz, 
        // ama isterseniz geçici olarak TaxNumber VO'sunu da esnetebiliriz.
      }
    }

    const props: CompanyProps = {
      taxNumber: taxNumber,
      name: record.name,
      address: record.address,  
      phone: record.phone,
      email: record.email,
      website: record.website,
      logo: record.logo,
      registrationNumber: record.registrationNumber,
      taxOffice: record.taxOffice,
      representativeName: record.representativeName,
      representativePhone: record.representativePhone,
      vatRate: Number(record.vatRate),
      status: record.status,
      companyType: record.companyType,
      tradeRegistryNumber: record.tradeRegistryNumber,
      mersisNumber: record.mersisNumber,
      kepAddress: record.kepAddress,
      verifiedAt: record.verifiedAt,
      deletedAt: record.deletedAt,
    };

    return Company.fromPersistence(props, record.id);
  }

  public static toPersistence(company: Company): any {
    const props = company.getProps();
    return {
      id: company.id,
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
