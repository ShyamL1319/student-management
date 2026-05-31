import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Parent, ParentDocument } from './schemas/parent.schema';

@Injectable()
export class ParentsService {
  constructor(
    @InjectModel(Parent.name) private parentModel: Model<ParentDocument>,
  ) {}

  async create(data: any) {
    return this.parentModel.create(data);
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search } = query;
    const q: any = {};
    if (search) q.name = { $regex: search, $options: 'i' };
    const itemsQuery = this.parentModel
      .find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const [data, total] = await Promise.all([
      itemsQuery.exec(),
      this.parentModel.countDocuments(q).exec(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const item = await this.parentModel.findById(id).exec();
    if (!item) throw new NotFoundException('Parent not found');
    return item;
  }

  async update(id: string, data: any) {
    const updated = await this.parentModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Parent not found');
    return updated;
  }

  async remove(id: string) {
    const removed = await this.parentModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Parent not found');
    return removed;
  }
}
