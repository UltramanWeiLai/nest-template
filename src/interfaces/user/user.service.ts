import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { isEmpty, md5 } from '@/utils';
import { BusinessException } from '@/exceptions/business/business';
import { getFeishuAppAccessToken, getFeishuUserAccessInfo, getFeishuUserInfo } from '@/utils';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { FeishuUser } from './entities/feishu-user.entity';
import { UpdatePasswordUserDto } from './dto/update-password-user.dto';
import { RoleUserGroupService } from '../role-user-group/role-user-group.service';
import { UserUserGroupService } from '../user-user-group/user-user-group.service';
import { RolePowerService } from '../role-power/role-power.service';
import { PowerService } from '../power/power.service';

/**
 * 检查用户是否不存在
 * @param {User} user - 要检查的用户对象
 * @throws {BusinessException} 如果用户不存在则抛出异常
 */
function isUserNotFound(user: User) {
  if (!user) throw BusinessException.throwResourceNotFound('用户不存在');
}

/**
 * 检查用户是否已禁用
 * @param {User} user - 要检查的用户对象
 * @throws {BusinessException} 如果用户已禁用则抛出异常
 */
function isUserDisabled(user: User) {
  if (user.status === 0) throw BusinessException.throwUserDisabled();
}

/**
 * 检查访问权限
 * @param {boolean} flag - 权限检查标志
 * @throws {BusinessException} 如果没有访问权限则抛出异常
 */
function isAccessForbidden(flag: boolean) {
  if (flag) throw BusinessException.throwAccessForbidden();
}

/**
 * 用户服务类
 * @description 提供用户相关的所有服务，包括：
 * - 用户注册、登录和密码管理
 * - 用户信息的增删改查
 * - 飞书账号的绑定和登录
 * - 用户权限和用户组管理
 */
@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(FeishuUser)
  private readonly feishuUserRepository: Repository<FeishuUser>;

  @Inject(RoleUserGroupService)
  private readonly roleUserGroupService: RoleUserGroupService;

  @Inject(UserUserGroupService)
  private readonly userUserGroupService: UserUserGroupService;

  @Inject(RolePowerService)
  private readonly rolePowerService: RolePowerService;

  @Inject(PowerService)
  private readonly powerService: PowerService;

  /**
   * 根据用户ID查找用户
   * @param {number} id - 用户ID
   * @returns {Promise<User>} 返回用户信息，包含飞书账号信息
   */
  async findById(id: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();
  }

  /**
   * 根据用户名查找用户
   * @param {string} username - 用户名
   * @returns {Promise<User>} 返回用户信息，包含飞书账号信息
   */
  async findByUsername(username: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();
  }

  /**
   * 根据飞书用户ID查找用户
   * @param {string} userId - 飞书用户ID
   * @returns {Promise<User>} 返回用户信息，包含飞书账号信息
   */
  async findByUserId(userId: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.feishu.userId = :userId', { userId })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();
  }

  /**
   * 用户登录
   * @param {LoginUserDto} loginUserDto - 登录信息DTO
   * @returns {Promise<User & { powers: Power[] }>} 返回用户信息和权限列表
   * @throws {BusinessException} 当用户不存在或密码错误时抛出异常
   */
  async login(loginUserDto: LoginUserDto) {
    const userInfo = await this.findByUsername(loginUserDto.username);

    isUserNotFound(userInfo);
    if (userInfo.password !== md5(loginUserDto.password)) throw new BusinessException({ code: 403, message: '密码错误' });

    const userGroupIds = (await this.userUserGroupService.getUserUserGroups(userInfo.id)).map((item) => item.userGroupId);
    const roleIds = (await this.roleUserGroupService.getUserGroupsRoles(userGroupIds)).map((item) => item.roleId);
    const powerIds = (await this.rolePowerService.getRolesPower(roleIds)).map((item) => item.powerId);
    const powers = await this.powerService.findByIds(powerIds);
    Reflect.deleteProperty(userInfo, 'password');

    return { ...userInfo, powers };
  }

  /**
   * 绑定飞书账号
   * @param {string} username - 用户名
   * @param {string} code - 飞书授权码
   * @returns {Promise<User>} 返回更新后的用户信息
   * @throws {BusinessException} 当用户不存在、Token无效或已绑定飞书账号时抛出异常
   */
  async bindFeishu(username: string, code: string) {
    const userInfo = await this.findByUsername(username);

    if (!userInfo) throw BusinessException.throwTokenInvalid();
    if (userInfo.feishu) throw new BusinessException({ code: 403, message: '用户已绑定飞书账号' });

    const appAccessToken = await getFeishuAppAccessToken();
    const userAccessInfo = await getFeishuUserAccessInfo(code, appAccessToken);
    const feishuUserInfo = await getFeishuUserInfo(userAccessInfo['access_token']);

    const feishuUser = await this.feishuUserRepository.findOneBy({ userId: feishuUserInfo.userId });
    if (!feishuUser) await this.feishuUserRepository.save(feishuUserInfo);
    userInfo.feishu = feishuUserInfo;
    Reflect.deleteProperty(userInfo, 'password');

    await this.userRepository.save(userInfo);
    return userInfo;
  }

  /**
   * 飞书账号登录
   * @param {string} code - 飞书授权码
   * @returns {Promise<User & { powers: Power[] }>} 返回用户信息和权限列表
   * @throws {BusinessException} 当飞书用户未绑定系统账号时抛出异常
   */
  async loginFeishu(code: string) {
    const appAccessToken = await getFeishuAppAccessToken();
    const userAccessInfo = await getFeishuUserAccessInfo(code, appAccessToken);
    const feishuUserInfo = await getFeishuUserInfo(userAccessInfo['access_token']);

    const userInfo = await this.findByUserId(feishuUserInfo.userId);

    if (!userInfo) throw new BusinessException({ code: 404, message: '飞书用户对应的用户账号不存在' });

    const userGroupIds = (await this.userUserGroupService.getUserUserGroups(userInfo.id)).map((item) => item.userGroupId);
    const roleIds = (await this.roleUserGroupService.getUserGroupsRoles(userGroupIds)).map((item) => item.roleId);
    const powerIds = (await this.rolePowerService.getRolesPower(roleIds)).map((item) => item.powerId);
    const powers = await this.powerService.findByIds(powerIds);
    Reflect.deleteProperty(userInfo, 'password');

    return { ...userInfo, powers };
  }

  /**
   * 用户注册
   * @param {RegisterUserDto} registerUserDto - 注册信息DTO
   * @returns {Promise<string>} 返回注册成功消息
   * @throws {BusinessException} 当用户名已存在时抛出异常
   */
  async register(registerUserDto: RegisterUserDto) {
    const userInfo = await this.userRepository.findOneBy({ username: registerUserDto.username });
    if (userInfo) throw new BusinessException.throwUserExists();

    const user = new User();
    user.username = registerUserDto.username;
    user.password = md5(registerUserDto.password);

    await this.userRepository.save(user);
    return '注册成功';
  }

  /**
   * 查询用户列表
   * @param {QueryUserDto} queryUserDto - 查询条件DTO
   * @returns {Promise<Record<string, unknown>>} 返回分页的用户列表
   */
  async findAll(queryUserDto: QueryUserDto) {
    const { username = '', name, currPage = 1, pageSize = 10 } = queryUserDto;

    const qb = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username like :username', { username: `%${username}%` })
      .andWhere(':name IS NULL or user.name like :name', { name: isEmpty(name) ? null : `%${name}%` })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .orderBy('user.id', 'DESC');

    const res: Record<string, unknown> = { currPage, pageSize };
    res.total = await qb.getCount();
    res.data = await qb
      .skip((currPage - 1) * pageSize)
      .take(pageSize)
      .getMany();

    (res.data as object[]).forEach((item) => Reflect.deleteProperty(item, 'password'));

    return res;
  }

  /**
   * 查询单个用户
   * @param {number} id - 用户ID
   * @returns {Promise<User>} 返回用户信息
   * @throws {BusinessException} 当用户不存在时抛出异常
   */
  async findOne(id: number) {
    const data = await this.findById(id);
    Reflect.deleteProperty(data, 'password');
    isUserNotFound(data);
    return data;
  }

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {UpdateUserDto} updateUserDto - 更新信息DTO
   * @returns {Promise<User>} 返回更新后的用户信息
   * @throws {BusinessException} 当用户不存在或已禁用时抛出异常
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const data = await this.findById(id);

    isUserNotFound(data);
    isUserDisabled(data);
    if ('name' in updateUserDto) data.name = updateUserDto.name;

    return this.userRepository.save(data).then(() => '修改成功');
  }

  /**
   * 更新用户密码
   * @param {number} id - 用户ID
   * @param {UpdatePasswordUserDto} updateUserDto - 密码更新DTO
   * @returns {Promise<string>} 返回更新成功消息
   * @throws {BusinessException} 当用户不存在、已禁用或无权限时抛出异常
   */
  async updatePassword(id: number, updateUserDto: UpdatePasswordUserDto) {
    const { password } = updateUserDto;
    const data = await this.userRepository.createQueryBuilder('user').where('user.id = :id', { id }).getOne();

    isUserNotFound(data);
    isUserDisabled(data);
    isAccessForbidden(data.id !== id); // 只能修改自己的密码

    data.password = md5(password);
    return this.userRepository.save(data).then(() => '修改成功');
  }

  /**
   * 删除用户（软删除）
   * @param {number} id - 用户ID
   * @returns {Promise<string>} 返回删除成功消息
   * @throws {BusinessException} 当用户不存在或已禁用时抛出异常
   */
  async remove(id: number) {
    const data = await this.findById(id);

    isUserNotFound(data);
    isUserDisabled(data);

    data.status = 0;
    return this.userRepository.save(data).then(() => '删除成功');
  }
}
