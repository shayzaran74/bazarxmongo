import { PrismaService } from '@barterborsa/shared-persistence';
import { IVerificationToken, IVerificationTokenRepository } from '../../domain/repositories/verification-token.repository.interface';
import { Optional } from '@barterborsa/shared-core';
export declare class PrismaVerificationTokenRepository implements IVerificationTokenRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, type: string, expiresAt: Date): Promise<string>;
    findByToken(token: string): Promise<Optional<IVerificationToken>>;
    delete(id: string): Promise<void>;
    deleteByUserIdAndType(userId: string, type: string): Promise<void>;
}
