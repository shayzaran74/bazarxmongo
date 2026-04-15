import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
declare const JwtAuthGuard_base: import("node_modules/@nestjs/passport").Type<import("node_modules/@nestjs/passport").IAuthGuard>;
/**
 * Tüm route'lar için varsayılan JWT koruması.
 * @Public() decorator'ü olan route'ları pas geçer.
 */
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private reflector;
    constructor(reflector: Reflector);
    /**
     * Request'in işlenip işlenmeyeceğine karar verir.
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
export {};
