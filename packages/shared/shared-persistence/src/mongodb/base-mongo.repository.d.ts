import { Model } from 'mongoose';
import { AggregateRoot, IRepository } from '@barterborsa/shared-core';
export declare abstract class BaseMongoRepository<TDomain extends AggregateRoot<any>, TPersistence> implements IRepository<TDomain> {
    protected readonly model: Model<TPersistence>;
    protected readonly mapper: {
        toDomain(persistence: TPersistence): TDomain;
        toPersistence(domain: TDomain): any;
    };
    constructor(model: Model<TPersistence>, mapper: {
        toDomain(persistence: TPersistence): TDomain;
        toPersistence(domain: TDomain): any;
    });
    findById(id: string): Promise<TDomain | null>;
    findAll(): Promise<TDomain[]>;
    save(entity: TDomain): Promise<void>;
    delete(id: string): Promise<void>;
}
