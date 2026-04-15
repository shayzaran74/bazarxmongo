export declare abstract class Entity<T> {
    protected readonly _id: string;
    protected readonly props: T;
    protected readonly _createdAt: Date;
    protected _updatedAt: Date;
    protected _version: number;
    constructor(props: T, id?: string);
    get id(): string;
    getProps(): T;
    get createdAt(): Date;
    get updatedAt(): Date;
    get version(): number;
    equals(object?: Entity<T>): boolean;
}
