import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleUserGroup } from './entities/role-user-group.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class RoleUserGroupService {
  @InjectRepository(RoleUserGroup) private readonly roleUserGroupRepository: Repository<RoleUserGroup>;

  // 批量绑定用户组
  async roleBindUserGroups(roleId: number, userGroupIds: number[]) {
    // 先删除当前角色的所有用户组
    await this.roleUserGroupRepository.delete({ roleId });

    // 添加新的用户组
    const roleUserGroups = userGroupIds.map((userGroupId) => ({ roleId, userGroupId }));
    return this.roleUserGroupRepository.save(roleUserGroups);
  }

  // 绑定用户组
  async roleBindUserGroup(roleId: number, userGroupId: number) {
    await this.roleUserGroupRepository.delete({ roleId, userGroupId });

    const roleUserGroup = new RoleUserGroup();
    roleUserGroup.roleId = roleId;
    roleUserGroup.userGroupId = userGroupId;

    return this.roleUserGroupRepository.save(roleUserGroup);
  }

  // 批量查询用户组的所有角色
  getUserGroupsRoles(userGroupIds: number[]) {
    return this.roleUserGroupRepository.find({
      where: {
        userGroupId: In(userGroupIds),
      },
    });
  }

  // 查询某个用户组的所有角色
  getUserGroupRoles(userGroupId: number) {
    return this.roleUserGroupRepository.find({
      where: {
        userGroupId,
      },
    });
  }

  //
  // --------------
  //

  // 批量绑定角色
  async userGroupBindRoles(userGroupId: number, roleIds: number[]) {
    // 先删除当前用户组的所有角色
    await this.roleUserGroupRepository.delete({ userGroupId });

    // 添加新的角色
    const roleUserGroups = roleIds.map((roleId) => ({ roleId, userGroupId }));
    return this.roleUserGroupRepository.save(roleUserGroups);
  }

  // 绑定角色
  async userGroupBindRole(userGroupId: number, roleId: number) {
    await this.roleUserGroupRepository.delete({ userGroupId, roleId });

    const roleUserGroup = new RoleUserGroup();
    roleUserGroup.roleId = roleId;
    roleUserGroup.userGroupId = userGroupId;

    return this.roleUserGroupRepository.save(roleUserGroup);
  }

  // 查询某个角色的所有用户组
  getRoleUserGroups(roleId: number) {
    return this.roleUserGroupRepository.find({
      where: {
        roleId,
      },
    });
  }
}
