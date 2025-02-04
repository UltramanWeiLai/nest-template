import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Req, UseGuards, Query } from '@nestjs/common';
import { UserGroupService } from './user-group.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { QueryUserGroupDto } from './dto/query-user-group.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Log } from '@/logger/log';
import { WINSTON_LOGGER_TOKEN } from '@/logger/winston.module';
import { UserGroup } from './entities/user-group.entity';
import { LoginGuard } from '@/guard/login/login-check.guard';
import { UpdateUserGroupRoleDto } from './dto/update-user-group-role.dto';
import { UpdateUserGroupUserDto } from './dto/update-user-group-user.dto';

@ApiTags('用户组')
@UseGuards(LoginGuard)
@Controller('user-group')
export class UserGroupController {
  @Inject(UserGroupService) private readonly userGroupService: UserGroupService;
  @Inject(WINSTON_LOGGER_TOKEN) private logger: Log;

  @ApiOperation({ summary: '新增用户组' })
  @Post()
  create(@Req() request: Request, @Body() createUserGroupDto: CreateUserGroupDto) {
    this.logger.info(`新增用户组: ${JSON.stringify(createUserGroupDto)}`, 'create', (request as any).username, 'UserGroupController');

    const userGroup = new UserGroup();
    userGroup.name = createUserGroupDto.name;
    userGroup.description = createUserGroupDto.description;
    userGroup.create = (request as any).username;

    return this.userGroupService.create(userGroup);
  }

  @ApiOperation({ summary: '查询所有用户组' })
  @Get()
  findAll(@Req() request: Request, @Query() queryUserGroupDto: QueryUserGroupDto) {
    this.logger.info(`查询所有用户组: ${JSON.stringify(queryUserGroupDto)}`, 'findAll', (request as any).username, 'UserGroupController');

    return this.userGroupService.findAll(queryUserGroupDto);
  }

  @ApiOperation({ summary: '查询单个用户组' })
  @Get(':id')
  findOne(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`查询单个用户组: ${id}`, 'findOne', (request as any).username, 'UserGroupController');

    return this.userGroupService.findOne(+id);
  }

  @ApiOperation({ summary: '修改用户组' })
  @Patch(':id')
  update(@Req() request: Request, @Param('id') id: string, @Body() updateUserGroupDto: UpdateUserGroupDto) {
    this.logger.info(`修改用户组: ${id} ${JSON.stringify(updateUserGroupDto)}`, 'update', (request as any).username, 'UserGroupController');

    return this.userGroupService.update(+id, updateUserGroupDto, (request as any).username);
  }

  @ApiOperation({ summary: '修改用户组用户' })
  @Patch('user/:id')
  updateUser(@Req() request: Request, @Param('id') id: string, @Body() updateUserGroupUserDto: UpdateUserGroupUserDto) {
    this.logger.info(`修改用户组用户: ${id} ${JSON.stringify(updateUserGroupUserDto)}`, 'setUser', (request as any).username, 'UserGroupController');

    return this.userGroupService.updateUser(+id, updateUserGroupUserDto, (request as any).username);
  }

  @ApiOperation({ summary: '修改用户组角色' })
  @Patch('role/:id')
  updateRole(@Req() request: Request, @Param('id') id: string, @Body() updateUserGroupRoleDto: UpdateUserGroupRoleDto) {
    this.logger.info(`修改用户组角色: ${id} ${JSON.stringify(updateUserGroupRoleDto)}`, 'setRole', (request as any).username, 'UserGroupController');

    return this.userGroupService.updateRole(+id, updateUserGroupRoleDto, (request as any).username);
  }

  @ApiOperation({ summary: '禁用用户组' })
  @Patch('disable/:id')
  disable(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`禁用用户组: ${id}`, 'disable', (request as any).username, 'UserGroupController');

    return this.userGroupService.disable(+id, (request as any).username);
  }

  @ApiOperation({ summary: '启用用户组' })
  @Patch('enable/:id')
  enable(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`启用用户组: ${id}`, 'enable', (request as any).username, 'UserGroupController');

    return this.userGroupService.enable(+id, (request as any).username);
  }

  @ApiOperation({ summary: '删除用户组' })
  @Delete(':id')
  remove(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`删除用户组: ${id}`, 'remove', (request as any).username, 'UserGroupController');

    return this.userGroupService.remove(+id);
  }
}
