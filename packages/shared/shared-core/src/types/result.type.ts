// packages/shared/shared-core/src/types/result.type.ts

export type Result<T, E = Error> = {
  success: boolean;
  data?: T;
  error?: E;
} & (
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E }
);

export const Ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const Err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

export type Optional<T> = T | null | undefined; // Not: Proje genelinde null vs undefined kullanımı tutarsız — standart belirlenmeli

export const isOk = <T, E>(result: Result<T, E>): result is { success: true; data: T } => {
  return result.success;
};

export const isErr = <T, E>(result: Result<T, E>): result is { success: false; error: E } => {
  return !result.success;
};

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
