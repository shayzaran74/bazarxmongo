import { PrismaService } from './prisma.service';
export declare abstract class BasePrismaRepository<TDomain, TPrismaModel> {
    protected readonly prisma: PrismaService;
    protected readonly modelName: string;
    constructor(prisma: PrismaService, modelName: string);
    protected get model(): any;
    findById(id: string): Promise<TDomain | null>;
    findAll(): Promise<TDomain[]>;
    delete(id: string): Promise<void>;
    /**
     * Prisma modelini Domain modeline dönüştürür.
     * Alt sınıflar tarafından implement edilmelidir.
     */
    protected abstract toDomain(record: TPrismaModel): TDomain;
    /**
     * Domain modelini Prisma modeline/inputuna dönüştürür.
     * Alt sınıflar tarafından implement edilmelidir.
     */
    protected abstract toPersistence(entity: TDomain): any;
}
