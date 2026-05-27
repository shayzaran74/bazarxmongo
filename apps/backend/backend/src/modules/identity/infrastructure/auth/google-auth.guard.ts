import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Fastify ve Passport arasındaki 'res.setHeader' uyumsuzluğunu gideren özel Google Guard.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger('GoogleAuthGuard');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('GoogleAuthGuard tetiklendi, Passport uyumluluk yaması uygulanıyor...');
    const response = context.switchToHttp().getResponse();
    
    /**
     * Passport OAuth stratejileri (Google gibi) yönlendirme yaparken Express'in res.setHeader metodunu arar.
     * Fastify'da bu metod bulunmadığı için çalışma anında (runtime) bir polyfill ekliyoruz.
     */
    if (!response.setHeader) {
      response.setHeader = (name: string, value: string) => {
        response.header(name, value);
      };
    }

    /**
     * Passport yönlendirmeyi bitirmek için res.end() metodunu çağırır.
     * Fastify'da bu metodu send() ile eşleştiriyoruz.
     */
    if (!response.end) {
      response.end = (payload: unknown) => {
        response.send(payload);
      };
    }
    
    // Passport'un standart canActivate mantığını çalıştır
    return (await super.canActivate(context)) as boolean;
  }
}
