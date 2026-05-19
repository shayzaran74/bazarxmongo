import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateProfileCommand } from './update-profile.command';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { Result } from '@barterborsa/shared-core';
import { PrismaService } from '@barterborsa/shared-persistence';
export declare class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand, Result<any>> {
    private readonly profileRepository;
    private readonly prisma;
    constructor(profileRepository: IUserProfileRepository, prisma: PrismaService);
    execute(command: UpdateProfileCommand): Promise<Result<any>>;
}
