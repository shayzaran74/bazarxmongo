// apps/backend/src/modules/loyalty/application/queries/loyalty-query.handlers.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserLevelQuery } from './get-user-level.query';
import { GetXpBalanceQuery } from './get-xp-balance.query';
import { GetXpHistoryQuery } from './get-xp-history.query';
import { GetMissionsQuery } from './get-missions.query';
import { GetUserMissionsQuery } from './get-user-missions.query';
import {
  IUserLevelRepository,
  IXpTransactionRepository,
  IMissionRepository,
  IUserMissionRepository,
} from '../../domain/repositories/loyalty.repository.interfaces';

@QueryHandler(GetUserLevelQuery)
export class GetUserLevelHandler implements IQueryHandler<GetUserLevelQuery> {
  constructor(@Inject('IUserLevelRepository') private readonly repository: IUserLevelRepository) {}
  async execute(query: GetUserLevelQuery) { return this.repository.findByUserId(query.userId); }
}

@QueryHandler(GetXpBalanceQuery)
export class GetXpBalanceHandler implements IQueryHandler<GetXpBalanceQuery> {
  constructor(@Inject('IUserLevelRepository') private readonly repository: IUserLevelRepository) {}
  async execute(query: GetXpBalanceQuery) {
    const userLevel = await this.repository.findByUserId(query.userId);
    return { currentXp: userLevel?.getProps().currentXp || 0 };
  }
}

@QueryHandler(GetXpHistoryQuery)
export class GetXpHistoryHandler implements IQueryHandler<GetXpHistoryQuery> {
  constructor(@Inject('IXpTransactionRepository') private readonly repository: IXpTransactionRepository) {}
  async execute(query: GetXpHistoryQuery) { return this.repository.findByUserId(query.userId, query.skip, query.take); }
}

@QueryHandler(GetMissionsQuery)
export class GetMissionsHandler implements IQueryHandler<GetMissionsQuery> {
  constructor(@Inject('IMissionRepository') private readonly repository: IMissionRepository) {}
  async execute() { return this.repository.findActive(); }
}

@QueryHandler(GetUserMissionsQuery)
export class GetUserMissionsHandler implements IQueryHandler<GetUserMissionsQuery> {
  constructor(@Inject('IUserMissionRepository') private readonly repository: IUserMissionRepository) {}
  async execute(query: GetUserMissionsQuery) { return this.repository.findByUserId(query.userId); }
}
