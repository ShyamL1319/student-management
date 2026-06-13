import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Post,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  UpdateUserRoleDto,
  AddRoleDto,
  ReplaceRolesDto,
} from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  findAll(@Query() query?: any) {
    return this.usersService.findAll(query);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user._id, updateProfileDto);
  }

  @Patch(':id/role')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @CurrentUser() requester: any,
  ) {
    return this.usersService.updateUserRole(
      id,
      updateUserRoleDto.roleId,
      requester,
    );
  }

  @Post(':id/roles')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  addRole(
    @Param('id') id: string,
    @Body() addRoleDto: AddRoleDto,
    @CurrentUser() requester: any,
  ) {
    return this.usersService.addRole(id, addRoleDto.roleId, requester);
  }

  @Delete(':id/roles/:roleId')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @CurrentUser() requester: any,
  ) {
    return this.usersService.removeRole(id, roleId, requester);
  }

  @Put(':id/roles')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  replaceRoles(
    @Param('id') id: string,
    @Body() replaceRolesDto: ReplaceRolesDto,
    @CurrentUser() requester: any,
  ) {
    return this.usersService.replaceRoles(
      id,
      replaceRolesDto.roleIds,
      requester,
    );
  }

  @Get(':id/roles')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  getUserRoles(@Param('id') id: string) {
    return this.usersService.getUserRoles(id);
  }
}
