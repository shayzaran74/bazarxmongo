import { PrismaService } from './prisma.service';
/**
 * Prisma modelleri için ortak metodları içeren interface.
 * 'any' kullanımını önlemek için tanımlanmıştır.
 */
interface GenericPrismaModel {
    findUnique(args: unknown): Promise<unknown>;
    findMany(args?: unknown): Promise<unknown[]>;
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
    delete(args: unknown): Promise<unknown>;
    count(args?: unknown): Promise<number>;
    upsert(args: unknown): Promise<unknown>;
}
export declare abstract class BasePrismaRepository<TDomain, TPrismaModel> {
    protected readonly prisma: PrismaService;
    protected readonly modelName: string;
    constructor(prisma: PrismaService, modelName: string);
    protected get model(): GenericPrismaModel;
    findById(id: string): Promise<TDomain | null>;
    findAll(): Promise<TDomain[]>;
    delete(id: string): Promise<void>;
    /**
     * Prisma modelini Domain modeline dönüştürür.
     */
    protected abstract toDomain(record: TPrismaModel): TDomain;
    /**
     * Domain modelini Prisma modeline/inputuna dönüştürür.
     */
    protected abstract toPersistence(entity: TDomain): unknown;
}
export {};
