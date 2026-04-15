export declare const IDEMPOTENT_KEY = "idempotent_key";
/**
 * Bu dekoratör, bir metodun idempotent (tekrarlanabilir ama yan etkisiz)
 * olması gerektiğini belirtir. Financial Service gibi hassas servislerde
 * mükerrer işlemleri önlemek için kullanılır.
 */
export declare const Idempotent: (options?: {
    ttl?: number;
}) => import("node_modules/@nestjs/common").CustomDecorator<string>;
