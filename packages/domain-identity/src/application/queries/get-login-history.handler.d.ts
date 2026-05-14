import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetLoginHistoryQuery } from './get-login-history.query';
import { Result } from '@barterborsa/shared-core';
export declare class GetLoginHistoryHandler implements IQueryHandler<GetLoginHistoryQuery, Result<any[]>> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetLoginHistoryQuery): Promise<Result<any[]>>;
}
