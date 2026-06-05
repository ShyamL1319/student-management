import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().populate('permissions').exec();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel
      .findById(id)
      .populate('permissions')
      .exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleModel
      .findOne({ name })
      .populate('permissions')
      .exec();
    if (!role) {
      throw new NotFoundException(`Role with name ${name} not found`);
    }
    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const createdRole = new this.roleModel(createRoleDto);
    return createdRole.save();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .populate('permissions')
      .exec();
    if (!updatedRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return updatedRole;
  }

  async remove(id: string): Promise<void> {
    const result = await this.roleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
  }
}
