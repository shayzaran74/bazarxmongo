// packages/shared/shared-security/src/auth/jwt-auth.guard.ts

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';
import { Observable } from 'rxjs';

/**
 * Tüm route'lar için varsayılan JWT koruması.
 * @Public() decorator'ü olan route'ları pas geçer.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Request nesnesini bağlama göre (HTTP, Ws, RPC) döner.
   */
  getRequest(context: ExecutionContext) {
    if (context.getType() === 'ws') {
      return context.switchToWs().getClient().handshake;
    }
    return context.switchToHttp().getRequest();
  }

  /**
   * Request'in işlenip işlenmeyeceğine karar verir.
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Sadece HTTP isteklerini bu guard ile koru. 
    // WebSocket ve RPC için özel auth mantığı kullanılmalıdır.
    if (context.getType() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
