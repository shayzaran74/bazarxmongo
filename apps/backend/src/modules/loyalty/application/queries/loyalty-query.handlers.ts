// apps/backend/src/modules/loyalty/application/queries/loyalty-query.handlers.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as qry from './loyalty.queries';
import { 
  IUserLevelRepository, 
  IXpTransactionRepository, 
  IMissionRepository, 
  IUserMissionRepository 
} from '../../domain/repositories/loyalty.repository.interfaces';

@QueryHandler(qry.GetUserLevelQuery)
export class GetUserLevelHandler implements IQueryHandler<qry.GetUserLevelQuery> {
  constructor(@Inject('IUserLevelRepository') private readonly repository: IUserLevelRepository) {}
  async execute(query: qry.GetUserLevelQuery) {
    return this.repository.findByUserId(query.userId);
  }
}

@QueryHandler(qry.GetXpBalanceQuery)
export class GetXpBalanceHandler implements IQueryHandler<qry.GetXpBalanceQuery> {
  constructor(@Inject('IUserLevelRepository') private readonly repository: IUserLevelRepository) {}
  async execute(query: qry.GetXpBalanceQuery) {
    const userLevel = await this.repository.findByUserId(query.userId);
    return { currentXp: userLevel?.getProps().currentXp || 0 };
  }
}

@QueryHandler(qry.GetXpHistoryQuery)
export class GetXpHistoryHandler implements IQueryHandler<qry.GetXpHistoryQuery> {
  constructor(@Inject('IXpTransactionRepository') private readonly repository: IXpTransactionRepository) {}
  async execute(query: qry.GetXpHistoryQuery) {
    return this.repository.findByUserId(query.userId, query.skip, query.take);
  }
}

@QueryHandler(qry.GetMissionsQuery)
export class GetMissionsHandler implements IQueryHandler<qry.GetMissionsQuery> {
  constructor(@Inject('IMissionRepository') private readonly repository: IMissionRepository) {}
  async execute() {
    return this.repository.findActive();
  }
}

@QueryHandler(qry.GetUserMissionsQuery)
export class GetUserMissionsHandler implements IQueryHandler<qry.GetUserMissionsQuery> {
  constructor(@Inject('IUserMissionRepository') private readonly repository: IUserMissionRepository) {}
  async execute(query: qry.GetUserMissionsQuery) {
    return this.repository.findByUserId(query.userId);
  }
}
