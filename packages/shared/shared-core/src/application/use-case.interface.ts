// packages/shared/shared-core/src/application/use-case.interface.ts

export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
