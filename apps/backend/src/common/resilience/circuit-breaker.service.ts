// apps/backend/src/common/resilience/circuit-breaker.service.ts

import { Injectable, Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';
import { CIRCUIT_BREAKER_TIMEOUT_MS, CIRCUIT_BREAKER_RESET_MS, CIRCUIT_BREAKER_ERROR_THRESHOLD_PCT } from '@barterborsa/shared-core';

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  fallbackResponse?: unknown;
}

const DEFAULT_OPTIONS: Required<CircuitBreakerOptions> = {
  timeout: CIRCUIT_BREAKER_TIMEOUT_MS,
  errorThresholdPercentage: CIRCUIT_BREAKER_ERROR_THRESHOLD_PCT,
  resetTimeout: CIRCUIT_BREAKER_RESET_MS,
  fallbackResponse: null,
};

@Injectable()
export class CircuitBreakerService {
  private readonly breakers = new Map<string, CircuitBreaker>();
  private readonly logger = new Logger(CircuitBreakerService.name);

  async execute<T>(
    name: string,
    fn: () => Promise<T>,
    options: CircuitBreakerOptions = {},
  ): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (!this.breakers.has(name)) {
      const breaker = new (CircuitBreaker as any)(async (task: () => Promise<T>) => await task(), {
        timeout: opts.timeout,
        errorThresholdPercentage: opts.errorThresholdPercentage,
        resetTimeout: opts.resetTimeout,
      });

      breaker.on('open', () => this.logger.warn(`Circuit breaker '${name}' açıldı`));
      breaker.on('close', () => this.logger.log(`Circuit breaker '${name}' kapandı`));

      this.breakers.set(name, breaker);
    }

    const breaker = this.breakers.get(name)!;

    try {
      return await breaker.fire(fn) as T;
    } catch (error: unknown) {
      if (opts.fallbackResponse !== undefined) {
        this.logger.warn(`Circuit breaker '${name}' fallback döndü: ${error instanceof Error ? error.message : String(error)}`);
        return opts.fallbackResponse as T;
      }
      throw error;
    }
  }
}
