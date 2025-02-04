import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUserGroup } from './entities/user-user-group.entity';

@Injectable()
export class UserUserGroupService {
  @InjectRepository(UserUserGroup) private readonly userUserGroupRepository: Repository<UserUserGroup>;

  // 批量绑定用户
  async userGroupBindUsers(userGroupId: number, userIds: number[]) {
    // 先删除当前用户组的所有用户
    await this.userUserGroupRepository.delete({ userGroupId });

    // 添加新的用户
    const userUserGroups = userIds.map((userId) => ({ userGroupId, userId }));
    return this.userUserGroupRepository.save(userUserGroups);
  }

  // 绑定用户
  async userGroupBindUser(userGroupId: number, userId: number) {
    await this.userUserGroupRepository.delete({ userGroupId, userId });

    const userUserGroup = new UserUserGroup();
    userUserGroup.userGroupId = userGroupId;
    userUserGroup.userId = userId;

    return this.userUserGroupRepository.save(userUserGroup);
  }

  // 查询某个用户的所有用户组
  getUserUserGroups(userId: number) {
    return this.userUserGroupRepository.find({
      where: {
        userId,
      },
    });
  }

  //
  // --------------
  //

  // 批量绑定用户组
  async userBindUserGroups(userId: number, userGroupIds: number[]) {
    // 先删除当前用户的所有用户组
    await this.userUserGroupRepository.delete({ userId });

    // 添加新的用户组
    const userUserGroups = userGroupIds.map((userGroupId) => ({ userGroupId, userId }));
    return this.userUserGroupRepository.save(userUserGroups);
  }

  // 绑定用户组
  async userBindUserGroup(userId: number, userGroupId: number) {
    await this.userUserGroupRepository.delete({ userId, userGroupId });

    const userUserGroup = new UserUserGroup();
    userUserGroup.userGroupId = userGroupId;
    userUserGroup.userId = userId;

    return this.userUserGroupRepository.save(userUserGroup);
  }

  // 查询某个用户组的所有用户
  getUserGroupUsers(userGroupId: number) {
    return this.userUserGroupRepository.find({
      where: {
        userGroupId,
      },
    });
  }
}
