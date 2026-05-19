import { Query } from '@barterborsa/shared-core';
export declare class GetUserQuery extends Query {
    readonly userId: string;
    constructor(userId: string);
}
