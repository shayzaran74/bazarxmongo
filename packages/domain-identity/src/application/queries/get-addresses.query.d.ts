import { Query } from '@barterborsa/shared-core';
export declare class GetAddressesQuery extends Query {
    readonly userId: string;
    constructor(userId: string);
}
