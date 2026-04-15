// packages/shared/shared-security/src/auth/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * Rol tabanlı erişim kontrolü. 
 * @Roles('ADMIN') gibi kullanımları denetler.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: { role: string } }>();
    
    // Eğer kullanıcı yoksa veya rolü uymuyorsa erişimi engelle
    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
