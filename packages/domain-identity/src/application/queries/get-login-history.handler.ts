import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { LoginHistory as LoginHistoryModel } from '@barterborsa/shared-persistence';
import { GetLoginHistoryQuery } from './get-login-history.query';
import { Result, Ok } from '@barterborsa/shared-core';

@QueryHandler(GetLoginHistoryQuery)
export class GetLoginHistoryHandler implements IQueryHandler<GetLoginHistoryQuery, Result<any[]>> {
  constructor() {}

  async execute(query: GetLoginHistoryQuery): Promise<Result<any[]>> {
    const history = await LoginHistoryModel.find({ userId: query.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    return Ok(history);
  }
}
