// packages/shared/shared-security/src/auth/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import type { RequestUser } from './jwt.strategy';

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

    // HTTP ve WebSocket context'leri için kullanıcı bilgisi al
    let user: RequestUser | undefined;

    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
      user = request?.user;
    } else if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient<{ user?: RequestUser }>();
      user = client?.user;
    } else {
      return true;
    }

    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
