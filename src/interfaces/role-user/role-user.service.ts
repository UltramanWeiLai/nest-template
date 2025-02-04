import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleUser } from './entities/role-user.entity';

@Injectable()
export class RoleUserService {
  @InjectRepository(RoleUser) private readonly roleUserRepository: Repository<RoleUser>;

  // 批量绑定用户
  async roleBindUsers(roleId: number, userIds: number[]) {
    // 先删除当前角色的所有用户
    await this.roleUserRepository.delete({ roleId });

    // 添加新的用户
    const roleUsers = userIds.map((userId) => ({ roleId, userId }));
    return this.roleUserRepository.save(roleUsers);
  }

  // 绑定用户
  async roleBindUser(roleId: number, userId: number) {
    await this.roleUserRepository.delete({ roleId, userId });

    const roleUser = new RoleUser();
    roleUser.roleId = roleId;
    roleUser.userId = userId;

    return this.roleUserRepository.save(roleUser);
  }

  // 查询某个用户的所有角色
  getUserRoles(userId: number) {
    return this.roleUserRepository.find({
      where: {
        userId,
      },
    });
  }

  //
  // --------------
  //

  // 批量绑定角色
  async userBindRoles(userId: number, roleIds: number[]) {
    // 先删除当前用户的所有角色
    await this.roleUserRepository.delete({ userId });

    // 添加新的角色
    const roleUsers = roleIds.map((roleId) => ({ roleId, userId }));
    return this.roleUserRepository.save(roleUsers);
  }

  // 绑定角色
  async userBindRole(userId: number, roleId: number) {
    await this.roleUserRepository.delete({ userId, roleId });

    const roleUser = new RoleUser();
    roleUser.roleId = roleId;
    roleUser.userId = userId;

    return this.roleUserRepository.save(roleUser);
  }

  // 查询某个角色的所有用户
  getRoleUsers(roleId: number) {
    return this.roleUserRepository.find({
      where: {
        roleId,
      },
    });
  }
}
