import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { UserGroup, UserGroupState } from './entities/user-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryUserGroupDto } from './dto/query-user-group.dto';
import { BusinessException } from '@/exceptions/business/business';
import { RoleUserGroupService } from '../role-user-group/role-user-group.service';
import { UserUserGroupService } from '../user-user-group/user-user-group.service';
import { UpdateUserGroupRoleDto } from './dto/update-user-group-role.dto';
import { UpdateUserGroupUserDto } from './dto/update-user-group-user.dto';

@Injectable()
export class UserGroupService {
  @Inject(RoleUserGroupService) private readonly roleUserGroupService: RoleUserGroupService;
  @Inject(UserUserGroupService) private readonly userUserGroupService: UserUserGroupService;

  @InjectRepository(UserGroup)
  private readonly userGroupRepository: Repository<UserGroup>;

  create(userGroup: UserGroup) {
    if (this.userGroupRepository.findOneBy({ name: userGroup.name })) throw BusinessException.throwResourceOccupied('用户组名称已存在');

    return this.userGroupRepository.save(userGroup);
  }

  async findAll(queryUserGroupDto: QueryUserGroupDto) {
    const { name, pageSize = 10, currPage = 1 } = queryUserGroupDto;
    const query = this.userGroupRepository.createQueryBuilder('userGroup');
    query.andWhere('userGroup.state = :state', { state: 1 });
    name && query.andWhere('userGroup.name like :name', { name: `%${name}%` });
    // userId && query.andWhere('userGroup.userId = :userId', { userId }) // TODO
    query.orderBy('userGroup.id', 'DESC');
    const res: any = {};
    res.currPage = currPage;
    res.pageSize = pageSize;
    res.total = await query.getCount();
    res.data = await query
      .skip((currPage - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return res;
  }

  async findOne(id: number) {
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    if (!userGroup) throw BusinessException.throwResourceNotFound('用户组不存在');
    if (userGroup.state === UserGroupState.Disable) throw BusinessException.throwResourceDisabled('用户组已禁用');

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

    if (!userGroup) throw BusinessException.throwResourceNotFound('用户组不存在');
    if (userGroupName && userGroupName.id !== id) throw BusinessException.throwResourceOccupied('用户组名称已存在');
    if (userGroup.state === UserGroupState.Disable) throw BusinessException.throwResourceDisabled('用户组已禁用');

    name && (userGroup.name = name);
    description && (userGroup.description = description);
    userGroup.update = username;

    return this.userGroupRepository.save(userGroup);
  }

  async updateUser(id: number, updateUserGroupUserDto: UpdateUserGroupUserDto, username: string) {
    const { user } = updateUserGroupUserDto;
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    if (!userGroup) throw BusinessException.throwResourceNotFound('用户组不存在');
    if (userGroup.state === UserGroupState.Disable) throw BusinessException.throwResourceDisabled('用户组已禁用');

    await this.userUserGroupService.userGroupBindUsers(id, user);

    userGroup.update = username;
    await this.userGroupRepository.save(userGroup);

    return '用户组用户修改成功';
  }

  async updateRole(id: number, updateUserGroupRoleDto: UpdateUserGroupRoleDto, username: string) {
    const { role } = updateUserGroupRoleDto;
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    if (!userGroup) throw BusinessException.throwResourceNotFound('用户组不存在');
    if (userGroup.state === UserGroupState.Disable) throw BusinessException.throwResourceDisabled('用户组已禁用');

    await this.roleUserGroupService.userGroupBindRoles(id, role);

    userGroup.update = username;
    await this.userGroupRepository.save(userGroup);

    return '用户组角色修改成功';
  }

  async enable(id: number, username: string) {
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    if (!userGroup) throw BusinessException.throwResourceNotFound('用户组不存在');
    if (userGroup.state === UserGroupState.Enable) return '用户组已启用';

    userGroup.state = UserGroupState.Enable;
    userGroup.update = username;

    return this.userGroupRepository.save(userGroup);
  }

  async disable(id: number, username: string) {
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    if (!userGroup) throw BusinessException.throwResourceNotFound('用户组不存在');
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
