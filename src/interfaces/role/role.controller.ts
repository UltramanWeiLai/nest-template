import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, Query, Req } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Log } from '@/logger/log';
import { WINSTON_LOGGER_TOKEN } from '@/logger/winston.module';
import { LoginGuard } from '@/guard/login/login-check.guard';
import { QueryRoleDto } from './dto/query-role.dto';
import { Request } from 'express';
import { UpdateRolePowerDto } from './dto/update-role-power.dto';
import { UpdateRoleUserDto } from './dto/update-role-user.dto';
import { UpdateRoleUserGroupDto } from './dto/update-role-user-group.dto';

@ApiTags('角色')
@Controller('role')
@UseGuards(LoginGuard)
export class RoleController {
  @Inject(RoleService) private readonly roleService: RoleService;
  @Inject(WINSTON_LOGGER_TOKEN) private logger: Log;

  @ApiOperation({ summary: '新增角色' })
  @Post()
  create(@Req() request: Request, @Body() createRoleDto: CreateRoleDto) {
    this.logger.info(`新增角色: ${JSON.stringify(createRoleDto)}`, 'create', (request as any).username, 'RoleController');

    return this.roleService.create(createRoleDto, (request as any).username);
  }

  @ApiOperation({ summary: '查询所有角色' })
  @Get()
  findAll(@Req() request: Request, @Query() queryRoleDto: QueryRoleDto) {
    this.logger.info(`查询所有角色: ${JSON.stringify(queryRoleDto)}`, 'findAll', (request as any).username, 'RoleController');

    return this.roleService.findAll(queryRoleDto);
  }

  @ApiOperation({ summary: '查询单个角色' })
  @Get(':id')
  findOne(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`查询单个角色: ${id}`, 'findOne', (request as any).username, 'RoleController');

    return this.roleService.findOne(+id);
  }

  @ApiOperation({ summary: '修改角色' })
  @Patch(':id')
  update(@Req() request: Request, @Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    this.logger.info(`修改角色: ${id} ${JSON.stringify(updateRoleDto)}`, 'update', (request as any).username, 'RoleController');

    return this.roleService.update(+id, updateRoleDto, (request as any).username);
  }

  @ApiOperation({ summary: '修改角色权限' })
  @Patch('power/:id')
  updatePower(@Req() request: Request, @Param('id') id: string, @Body() updateRolePowerDto: UpdateRolePowerDto) {
    this.logger.info(`修改角色权限: ${id} ${JSON.stringify(updateRolePowerDto)}`, 'updatePower', (request as any).username, 'RoleController');

    return this.roleService.updatePower(+id, updateRolePowerDto); // , (request as any).username
  }

  @ApiOperation({ summary: '修改角色用户' })
  @Patch('user/:id')
  updateUsers(@Req() request: Request, @Param('id') id: string, @Body() updateRoleUserDto: UpdateRoleUserDto) {
    this.logger.info(`修改角色用户: ${id} ${JSON.stringify(updateRoleUserDto)}`, 'updateUsers', (request as any).username, 'RoleController');

    return this.roleService.updateUsers(+id, updateRoleUserDto);
  }

  @ApiOperation({ summary: '修改角色用户组' })
  @Patch('userGroup/:id')
  updateUserGroups(@Req() request: Request, @Param('id') id: string, @Body() updateRoleUserGroupDto: UpdateRoleUserGroupDto) {
    this.logger.info(`修改角色用户: ${id} ${JSON.stringify(updateRoleUserGroupDto)}`, 'updateUsers', (request as any).username, 'RoleController');

    return this.roleService.updateUserGroups(+id, updateRoleUserGroupDto);
  }

  @ApiOperation({ summary: '启用角色' })
  @Patch('enable/:id')
  enable(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`启用角色: ${id}`, 'enable', (request as any).username, 'RoleController');

    return this.roleService.enable(+id);
  }

  @ApiOperation({ summary: '禁用角色' })
  @Patch('disable/:id')
  disable(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`禁用角色: ${id}`, 'disable', (request as any).username, 'RoleController');

    return this.roleService.disable(+id);
  }

  @ApiOperation({ summary: '删除角色' })
  @Delete(':id')
  delete(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`删除角色: ${id}`, 'remove', (request as any).username, 'RoleController');

    return this.roleService.delete(+id);
  }
}
