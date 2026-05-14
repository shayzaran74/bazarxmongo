export type Result<T, E = Error> = {
    success: boolean;
    data?: T;
    error?: E;
} & ({
    success: true;
    data: T;
    error?: never;
} | {
    success: false;
    data?: never;
    error: E;
});
export declare const Ok: <T>(data: T) => Result<T, never>;
export declare const Err: <E>(error: E) => Result<never, E>;
export type Optional<T> = T | null | undefined;
export declare const isOk: <T, E>(result: Result<T, E>) => result is {
    success: true;
    data: T;
};
export declare const isErr: <T, E>(result: Result<T, E>) => result is {
    success: false;
    error: E;
};
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}
