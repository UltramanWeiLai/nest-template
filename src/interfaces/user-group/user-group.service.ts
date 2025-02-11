import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BusinessException } from '@/exceptions/business/business';
import { isEmpty } from '@/utils';

import { UserGroup, UserGroupState } from './entities/user-group.entity';
import { RoleUserGroupService } from '../role-user-group/role-user-group.service';
import { UserUserGroupService } from '../user-user-group/user-user-group.service';
import { QueryUserGroupDto } from './dto/query-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { UpdateUserGroupRoleDto } from './dto/update-user-group-role.dto';
import { UpdateUserGroupUserDto } from './dto/update-user-group-user.dto';
import { CreateUserGroupDto } from './dto/create-user-group.dto';

/**
 * 检查用户组是否不存在
 * @param {UserGroup} userGroup - 用户组对象
 * @throws {BusinessException} 当用户组不存在时抛出异常
 */
function isUserGroupNotFound(userGroup: UserGroup) {
  if (!userGroup) throw BusinessException.throwResourceNotFound('用户组不存在');
}

/**
 * 检查用户组名称是否已被占用
 * @param {unknown} flag - 检查标志
 * @throws {BusinessException} 当用户组名称已存在时抛出异常
 */
function isUserGroupOccupied(flag: unknown) {
  if (flag) throw BusinessException.throwResourceOccupied('用户组名称已存在');
}

/**
 * 检查用户组是否已禁用
 * @param {UserGroup} userGroup - 用户组对象
 * @throws {BusinessException} 当用户组已禁用时抛出异常
 */
function isUserGroupDisabled(userGroup: UserGroup) {
  if (userGroup.state === UserGroupState.Disable) throw BusinessException.throwResourceDisabled('用户组已禁用');
}

/**
 * 用户组服务类
 * @description 提供用户组的创建、查询、更新、启用、禁用和删除等功能
 */
@Injectable()
export class UserGroupService {
  @Inject(RoleUserGroupService) private readonly roleUserGroupService: RoleUserGroupService;
  @Inject(UserUserGroupService) private readonly userUserGroupService: UserUserGroupService;

  @InjectRepository(UserGroup)
  private readonly userGroupRepository: Repository<UserGroup>;

  // 根据用户组 ids 获取用户组数据
  async getUserGroups(userGroupIds: number[]) {
    return await this.userGroupRepository.findBy({ id: In(userGroupIds) });
  }

  /**
   * 创建用户组
   * @param {UserGroup} CreateUserGroupDto - 用户组信息
   * @returns {Promise<UserGroup>} 创建的用户组信息
   * @throws {BusinessException} 当用户组名称已存在时抛出异常
   */
  async create(userGroup: CreateUserGroupDto) {
    isUserGroupOccupied(await this.userGroupRepository.findOneBy({ name: userGroup.name }));

    return this.userGroupRepository.save(userGroup);
  }

  /**
   * 查询用户组列表
   * @param {QueryUserGroupDto} queryUserGroupDto - 查询条件
   * @returns {Promise<Record<string, unknown>>} 分页的用户组列表
   */
  async findAll(queryUserGroupDto: QueryUserGroupDto) {
    const { name = '', pageSize = 10, currPage = 1 } = queryUserGroupDto;

    const query = this.userGroupRepository
      .createQueryBuilder('userGroup')
      .where('( :name IS NULL OR userGroup.name LIKE :name )', { name: isEmpty(name) ? null : `%${name}%` })
      .orderBy('userGroup.id', 'DESC');

    const res: Record<string, unknown> = { currPage, pageSize };
    res.total = await query.getCount();
    res.data = await query
      .skip((currPage - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return res;
  }

  /**
   * 查询单个用户组
   * @param {number} id - 用户组ID
   * @returns {Promise<UserGroup & { user: number[]; role: number[] }>} 用户组信息，包含用户和角色列表
   * @throws {BusinessException} 当用户组不存在或已禁用时抛出异常
   */
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

  /**
   * 更新用户组信息
   * @param {number} id - 用户组ID
   * @param {UpdateUserGroupDto} updateUserGroupDto - 更新的用户组信息
   * @param {string} username - 操作者用户名
   * @returns {Promise<UserGroup>} 更新后的用户组信息
   * @throws {BusinessException} 当用户组不存在、名称已被占用或已禁用时抛出异常
   */
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

  /**
   * 更新用户组的用户列表
   * @param {number} id - 用户组ID
   * @param {UpdateUserGroupUserDto} updateUserGroupUserDto - 更新的用户列表
   * @param {string} username - 操作者用户名
   * @returns {Promise<string>} 操作结果消息
   * @throws {BusinessException} 当用户组不存在或已禁用时抛出异常
   */
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

  /**
   * 更新用户组的角色列表
   * @param {number} id - 用户组ID
   * @param {UpdateUserGroupRoleDto} updateUserGroupRoleDto - 更新的角色列表
   * @param {string} username - 操作者用户名
   * @returns {Promise<string>} 操作结果消息
   * @throws {BusinessException} 当用户组不存在或已禁用时抛出异常
   */
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

  /**
   * 启用用户组
   * @param {number} id - 用户组ID
   * @param {string} username - 操作者用户名
   * @returns {Promise<string | UserGroup>} 操作结果消息或更新后的用户组信息
   * @throws {BusinessException} 当用户组不存在时抛出异常
   */
  async enable(id: number, username: string) {
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    isUserGroupNotFound(userGroup);
    if (userGroup.state === UserGroupState.Enable) return '用户组已启用';

    userGroup.state = UserGroupState.Enable;
    userGroup.update = username;

    return this.userGroupRepository.save(userGroup);
  }

  /**
   * 禁用用户组
   * @param {number} id - 用户组ID
   * @param {string} username - 操作者用户名
   * @returns {Promise<string | UserGroup>} 操作结果消息或更新后的用户组信息
   * @throws {BusinessException} 当用户组不存在时抛出异常
   */
  async disable(id: number, username: string) {
    const userGroup = await this.userGroupRepository.findOneBy({ id });

    isUserGroupNotFound(userGroup);
    if (userGroup.state === UserGroupState.Disable) return '用户组已禁用';

    userGroup.state = UserGroupState.Disable;
    userGroup.update = username;

    return this.userGroupRepository.save(userGroup);
  }

  /**
   * 删除用户组
   * @param {number} id - 用户组ID
   * @returns {Promise<any>} 删除操作结果
   * @throws {BusinessException} 当用户组不存在、存在关联用户或角色时抛出异常
   */
  async remove(id: number) {
    const users = await this.userUserGroupService.getUserGroupUsers(id);
    const roles = await this.roleUserGroupService.getUserGroupRoles(id);

    if (users.length) throw BusinessException.throwResourceOccupied('用户组下存在用户，无法删除');
    if (roles.length) throw BusinessException.throwResourceOccupied('用户组下存在角色，无法删除');

    return this.userGroupRepository.delete(id);
  }
}
