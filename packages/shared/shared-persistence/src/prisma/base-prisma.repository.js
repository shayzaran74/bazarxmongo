"use strict";
// packages/shared/shared-persistence/src/prisma/base-prisma.repository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePrismaRepository = void 0;
class BasePrismaRepository {
    prisma;
    modelName;
    constructor(prisma, modelName) {
        this.prisma = prisma;
        this.modelName = modelName;
    }
    get model() {
        return this.prisma[this.modelName];
    }
    async findById(id) {
        const record = await this.model.findUnique({
            where: { id },
        });
        return record ? this.toDomain(record) : null;
    }
    async findAll() {
        const records = await this.model.findMany();
        return records.map((r) => this.toDomain(r));
    }
    async delete(id) {
        await this.model.delete({
            where: { id },
        });
    }
}
exports.BasePrismaRepository = BasePrismaRepository;
//# sourceMappingURL=base-prisma.repository.js.map