import { ExecutionContext } from '@nestjs/common';
declare const GoogleAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
/**
 * Fastify ve Passport arasındaki 'res.setHeader' uyumsuzluğunu gideren özel Google Guard.
 */
export declare class GoogleAuthGuard extends GoogleAuthGuard_base {
    private readonly logger;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};
