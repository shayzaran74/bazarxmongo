# Style & Quality Guidelines

## Code Quality
- **ZERO TOLERANCE for `any`**.
- **File Headers:** Her dosyanın tam path'ini başına yorum satırı olarak yaz (örn: `// packages/shared/shared-core/src/domain/entity.base.ts`).
- **TypeScript Direktifleri:** `@ts-ignore` veya `@ts-expect-error` kullanımı YASAKTIR.
- Use **ESLint** and **Prettier** for formatting.
- Every function must have explicit parameter and return types.
- TypeScript strict mode uyumlu yaz.

## Communication
- **Code comments must be in Turkish.**
- Function and variable names must be in English (CamelCase).
- Explanations in PRs or terminal output should be clear and professional.

## Logging
- Use `StructuredLogger` from `@barterborsa/shared-observability`.
- `console.log` is strictly forbidden.
- Use levels: `info`, `warn`, `error`, `debug` correctly.

## Memory Maintenance (Hafıza Yönetimi)
- **Kritik Kural:** Her büyük görev (task) bittiğinde veya önemli bir mimari karar verildiğinde, bu bilgiyi `CLAUDE.md` içindeki **History** bölümüne kısaca işle.
- Bu işlem, sonraki oturumlarda Claude'un neyin neden yapıldığını hatırlamasını sağlar.
- Yapılan işleri bir tablo veya liste şeklinde özetle.
