import { Model, Document, QueryFilter, UpdateQuery, Types } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(doc: Partial<T>): Promise<T> {
    return this.model.create(doc);
  }

  async find(filter: QueryFilter<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findOne(filter: QueryFilter<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, updateData: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter: QueryFilter<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  // Cross-tenant query method for SUPER_ADMIN or global system operations
  async findGlobal(filter: QueryFilter<T> = {}): Promise<T[]> {
    return this.model.find(filter).setOptions({ bypassTenant: true }).exec();
  }
}
