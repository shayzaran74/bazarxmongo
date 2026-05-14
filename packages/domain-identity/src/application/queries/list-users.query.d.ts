import { Query } from '@barterborsa/shared-core';
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export declare class ListUsersQuery extends Query {
    readonly pagination: PaginationParams;
    readonly filters?: {
        role?: string;
        status?: string;
        search?: string;
    } | undefined;
    constructor(pagination: PaginationParams, filters?: {
        role?: string;
        status?: string;
        search?: string;
    } | undefined);
}
