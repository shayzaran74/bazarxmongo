import { IVerificationTokenRepository } from '../../domain/repositories/verification-token.repository.interface';
export declare class MongoVerificationTokenRepository implements IVerificationTokenRepository {
    private readonly model;
    constructor();
    create(userId: string, type: string, expiresAt: Date): Promise<string>;
    findByToken(token: string): Promise<{
        id: any;
        userId: any;
        token: any;
        type: "EMAIL" | "PHONE" | "PASSWORD_RESET";
        expiresAt: any;
        createdAt: any;
    }>;
    delete(id: string): Promise<void>;
    deleteByUserIdAndType(userId: string, type: string): Promise<void>;
}
