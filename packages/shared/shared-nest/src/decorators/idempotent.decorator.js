"use strict";
// packages/shared/shared-nest/src/decorators/idempotent.decorator.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Idempotent = exports.IDEMPOTENT_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IDEMPOTENT_KEY = 'idempotent_key';
/**
 * Bu dekoratör, bir metodun idempotent (tekrarlanabilir ama yan etkisiz)
 * olması gerektiğini belirtir. Financial Service gibi hassas servislerde
 * mükerrer işlemleri önlemek için kullanılır.
 */
const Idempotent = (options) => (0, common_1.SetMetadata)(exports.IDEMPOTENT_KEY, options || { ttl: 86400 }); // Varsayılan 24 saat
exports.Idempotent = Idempotent;
//# sourceMappingURL=idempotent.decorator.js.map