import { Query } from '@barterborsa/shared-core';
export declare class GetLoginHistoryQuery extends Query {
    readonly userId: string;
    constructor(userId: string);
}
