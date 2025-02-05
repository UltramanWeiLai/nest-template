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

function isUserNotFound(user: User) {
  if (!user) throw BusinessException.throwResourceNotFound('用户不存在');
}

function isUserDisabled(user: User) {
  if (user.status === 0) throw BusinessException.throwUserDisabled();
}

function isAccessForbidden(flag: boolean) {
  if (flag) throw BusinessException.throwAccessForbidden();
}

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

  async findById(id: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();
  }

  async findByUsername(username: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();
  }

  async findByUserId(userId: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.feishu.userId = :userId', { userId })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();
  }

  async login(loginUserDto: LoginUserDto) {
    const userInfo = await this.findByUsername(loginUserDto.username);

    isUserNotFound(userInfo);
    if (userInfo.password !== md5(loginUserDto.password)) throw new BusinessException({ code: 403, message: '密码错误' });

    const userGroupIds = (await this.userUserGroupService.getUserUserGroups(userInfo.id)).map((item) => item.userGroupId);
    const roleIds = (await this.roleUserGroupService.getUserGroupsRoles(userGroupIds)).map((item) => item.roleId);
    const powerIds = (await this.rolePowerService.getRolesPower(roleIds)).map((item) => item.powerId);
    const powers = await this.powerService.findByIds(powerIds);

    return { ...userInfo, powers };
  }

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

    await this.userRepository.save(userInfo);
    return userInfo;
  }

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

    return { ...userInfo, powers };
  }

  async register(registerUserDto: RegisterUserDto) {
    const userInfo = await this.userRepository.findOneBy({ username: registerUserDto.username });
    if (userInfo) throw new BusinessException.throwUserExists();

    const user = new User();
    user.username = registerUserDto.username;
    user.password = md5(registerUserDto.password);

    await this.userRepository.save(user);
    return '注册成功';
  }

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

    return res;
  }

  async findOne(id: number) {
    const data = await this.findById(id);

    isUserNotFound(data);
    return data;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data = await this.findById(id);

    isUserNotFound(data);
    isUserDisabled(data);
    if ('name' in updateUserDto) data.name = updateUserDto.name;

    return this.userRepository.save(data);
  }

  async updatePassword(id: number, updateUserDto: UpdatePasswordUserDto) {
    const { password } = updateUserDto;
    const data = await this.userRepository.createQueryBuilder('user').where('user.id = :id', { id }).getOne();

    isUserNotFound(data);
    isUserDisabled(data);
    isAccessForbidden(data.id !== id); // 只能修改自己的密码

    data.password = md5(password);
    return this.userRepository.save(data).then(() => '修改成功');
  }

  async remove(id: number) {
    const data = await this.findById(id);

    isUserNotFound(data);
    isUserDisabled(data);

    data.status = 0;
    return this.userRepository.save(data).then(() => '删除成功');
  }
}
