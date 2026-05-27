import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Company } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { GetPendingCompaniesQuery } from './get-pending-companies.query';

@QueryHandler(GetPendingCompaniesQuery)
export class GetPendingCompaniesHandler
  implements IQueryHandler<GetPendingCompaniesQuery> {

  async execute() {
    const docs = await Company.find({ status: 'PENDING' })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map(doc => doc.toObject());
  }
}
