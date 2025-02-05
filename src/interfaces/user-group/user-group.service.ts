import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessException } from '@/exceptions/business/business';
import { isEmpty } from '@/utils';

import { UserGroup, UserGroupState } from './entities/user-group.entity';
import { RoleUserGroupService } from '../role-user-group/role-user-group.service';
import { UserUserGroupService } from '../user-user-group/user-user-group.service';
import { QueryUserGroupDto } from './dto/query-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { UpdateUserGroupRoleDto } from './dto/update-user-group-role.dto';
import { UpdateUserGroupUserDto } from './dto/update-user-group-user.dto';

function isUserGroupNotFound(userGroup: UserGroup) {
  if (!userGroup) throw BusinessException.throwResourceNotFound('用户组不存在');
}

function isUserGroupOccupied(flag: unknown) {
  if (flag) throw BusinessException.throwResourceOccupied('用户组名称已存在');
}

function isUserGroupDisabled(userGroup: UserGroup) {
  if (userGroup.state === UserGroupState.Disable) throw BusinessException.throwResourceDisabled('用户组已禁用');
}

@Injectable()
export class UserGroupService {
  @Inject(RoleUserGroupService) private readonly roleUserGroupService: RoleUserGroupService;
  @Inject(UserUserGroupService) private readonly userUserGroupService: UserUserGroupService;

  @InjectRepository(UserGroup)
  private readonly userGroupRepository: Repository<UserGroup>;

  async create(userGroup: UserGroup) {
    isUserGroupOccupied(await this.userGroupRepository.findOneBy({ name: userGroup.name }));

    return this.userGroupRepository.save(userGroup);
  }

  async findAll(queryUserGroupDto: QueryUserGroupDto) {
    const { name = '', pageSize = 10, currPage = 1 } = queryUserGroupDto;

    const query = this.userGroupRepository
      .createQueryBuilder('userGroup')
      .andWhere('userGroup.state = :state', { state: 1 })
      .andWhere('( :name IS NULL OR userGroup.name LIKE :name )', { name: isEmpty(name) ? null : `%${name}%` })
      .orderBy('userGroup.id', 'DESC');

    const res: Record<string, unknown> = { currPage, pageSize };
    res.total = await query.getCount();
    res.data = await query
      .skip((currPage - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return res;
  }

  async findOne(id: number) {
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    isUserGroupNotFound(userGroup);
    isUserGroupDisabled(userGroup);

    const user = await this.userUserGroupService.getUserGroupUsers(id);
    const role = await this.roleUserGroupService.getUserGroupRoles(id);

    return {
      ...userGroup,
      user: user.map((item) => item.userId),
      role: role.map((item) => item.roleId),
    };
  }

  async update(id: number, updateUserGroupDto: UpdateUserGroupDto, username: string) {
    const { name, description } = updateUserGroupDto;
    const userGroup = await this.userGroupRepository.findOneBy({ id });
    const userGroupName = await this.userGroupRepository.findOneBy({ name });

    isUserGroupNotFound(userGroup);
    isUserGroupOccupied(userGroupName && userGroupName.id !== id);
    isUserGroupDisabled(userGroup);

    name && (userGroup.name = name);
    description && (userGroup.description = description);
    userGroup.update = username;

    return this.userGroupRepository.save(userGroup);
  }

  async updateUser(id: number, updateUserGroupUserDto: UpdateUserGroupUserDto, username: string) {
    const { user } = updateUserGroupUserDto;
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    isUserGroupNotFound(userGroup);
    isUserGroupDisabled(userGroup);

    await this.userUserGroupService.userGroupBindUsers(id, user);

    userGroup.update = username;
    await this.userGroupRepository.save(userGroup);

    return '用户组用户修改成功';
  }

  async updateRole(id: number, updateUserGroupRoleDto: UpdateUserGroupRoleDto, username: string) {
    const { role } = updateUserGroupRoleDto;
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    isUserGroupNotFound(userGroup);
    isUserGroupDisabled(userGroup);

    await this.roleUserGroupService.userGroupBindRoles(id, role);

    userGroup.update = username;
    await this.userGroupRepository.save(userGroup);

    return '用户组角色修改成功';
  }

  async enable(id: number, username: string) {
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    isUserGroupNotFound(userGroup);
    if (userGroup.state === UserGroupState.Enable) return '用户组已启用';

    userGroup.state = UserGroupState.Enable;
    userGroup.update = username;

    return this.userGroupRepository.save(userGroup);
  }

  async disable(id: number, username: string) {
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    isUserGroupNotFound(userGroup);
    if (userGroup.state === UserGroupState.Disable) return '用户组已禁用';

    userGroup.state = UserGroupState.Disable;
    userGroup.update = username;

    return this.userGroupRepository.save(userGroup);
  }

  async remove(id: number) {
    const users = await this.userUserGroupService.getUserGroupUsers(id);
    const roles = await this.roleUserGroupService.getUserGroupRoles(id);

    if (users.length) throw BusinessException.throwResourceOccupied('用户组下存在用户，无法删除');
    if (roles.length) throw BusinessException.throwResourceOccupied('用户组下存在角色，无法删除');

    return this.userGroupRepository.delete(id);
  }
}
