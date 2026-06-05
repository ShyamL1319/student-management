import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/role.enum';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles(RoleEnum.SUPER_ADMIN)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.SCHOOL_ADMIN)
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.SCHOOL_ADMIN)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
