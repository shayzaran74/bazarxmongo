import { IQueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Result } from '@barterborsa/shared-core';
import { PrismaService } from '@barterborsa/shared-persistence';
export declare class GetUserHandler implements IQueryHandler<GetUserQuery, Result<any>> {
    private readonly userRepository;
    private readonly prisma;
    constructor(userRepository: IUserRepository, prisma: PrismaService);
    execute(query: GetUserQuery): Promise<Result<any>>;
}
