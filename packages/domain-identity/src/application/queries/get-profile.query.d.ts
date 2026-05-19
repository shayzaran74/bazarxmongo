import { Query } from '@barterborsa/shared-core';
export declare class GetProfileQuery extends Query {
    readonly userId: string;
    constructor(userId: string);
}
