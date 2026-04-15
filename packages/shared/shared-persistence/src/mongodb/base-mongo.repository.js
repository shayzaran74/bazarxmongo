"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMongoRepository = void 0;
class BaseMongoRepository {
    model;
    mapper;
    constructor(model, mapper) {
        this.model = model;
        this.mapper = mapper;
    }
    async findById(id) {
        const doc = await this.model.findById(id).exec();
        if (!doc)
            return null;
        return this.mapper.toDomain(doc);
    }
    async findAll() {
        const docs = await this.model.find().exec();
        return docs.map(doc => this.mapper.toDomain(doc));
    }
    async save(entity) {
        const persistence = this.mapper.toPersistence(entity);
        const existing = await this.model.findById(entity.id).exec();
        if (existing) {
            await this.model.findByIdAndUpdate(entity.id, persistence).exec();
        }
        else {
            const created = new this.model(persistence);
            await created.save();
        }
    }
    async delete(id) {
        await this.model.findByIdAndDelete(id).exec();
    }
}
exports.BaseMongoRepository = BaseMongoRepository;
//# sourceMappingURL=base-mongo.repository.js.map