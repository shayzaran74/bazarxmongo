declare module 'opossum' {
  interface CircuitBreakerOptions {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    volumeThreshold?: number;
  }

  class CircuitBreaker {
    constructor(fn: () => unknown, options?: CircuitBreakerOptions);
    fire<T>(fn: () => Promise<T>): Promise<T>;
    open: boolean;
    closed: boolean;
    halfOpen: boolean;
    on(event: string, handler: () => void): void;
    on(event: 'open' | 'close' | 'halfOpen', handler: () => void): void;
  }

  export = CircuitBreaker;
}
