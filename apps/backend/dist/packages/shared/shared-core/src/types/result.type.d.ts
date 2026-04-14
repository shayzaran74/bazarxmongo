export type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
export declare const Ok: <T>(data: T) => Result<T, never>;
export declare const Err: <E>(error: E) => Result<never, E>;
export type Optional<T> = T | null | undefined;
