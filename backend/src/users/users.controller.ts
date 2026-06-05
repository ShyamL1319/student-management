import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateUserRoleDto } from './dto/update-user.dto';
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
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.SCHOOL_ADMIN)
  findAll() {
    return this.usersService.findAll();
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
  @Roles(RoleEnum.SUPER_ADMIN)
  updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(id, updateUserRoleDto.roleId);
  }
}
