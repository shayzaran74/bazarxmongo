import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
/**
 * Rol tabanlı erişim kontrolü.
 * @Roles('ADMIN') gibi kullanımları denetler.
 */
export declare class RolesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
