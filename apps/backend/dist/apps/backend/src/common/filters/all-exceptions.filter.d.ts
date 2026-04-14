import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
/**
 * Tüm hataları yakalayıp detaylıca loglayan merkezi hata filtresi.
 * 500 hatalarının gerçek sebebini görmek için kritik öneme sahiptir.
 */
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
