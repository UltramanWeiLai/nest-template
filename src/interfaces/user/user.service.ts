import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';

import { BusinessException } from '@/exceptions/business/business';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { loadEnvConfig } from '@/utils';
import { FeishuUser } from './entities/feishu-user.entity';
import { UpdatePasswordUserDto } from './dto/update-password-user.dto';
import { RoleUserGroupService } from '../role-user-group/role-user-group.service';
import { UserUserGroupService } from '../user-user-group/user-user-group.service';
import { RolePowerService } from '../role-power/role-power.service';
import { PowerService } from '../power/power.service';

const { FEISHU_CONFIG } = loadEnvConfig();

const md5 = (str: string) => {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};

// 获取飞书应用授权失败
const isFeishuAuthorizationFails = (res: { code: number }, message = '获取飞书应用授权失败') => {
  if (res.code !== 0) throw new BusinessException({ code: res.code, message });
};

// 获取飞书应用 access_token
const getFeishuAppAccessToken = async () => {
  const { data: res } = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
    app_id: FEISHU_CONFIG.appid,
    app_secret: FEISHU_CONFIG.appsecret,
  });

  isFeishuAuthorizationFails(res);
  return res['app_access_token'];
};

// 获取飞书用户授权信息
const getFeishuUserAccessInfo = async (code: string, appAccessToken: string) => {
  const { data: res } = await axios({
    method: 'POST',
    url: 'https://open.feishu.cn/open-apis/authen/v1/oidc/access_token',
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    data: {
      grant_type: 'authorization_code',
      code,
    },
  });

  isFeishuAuthorizationFails(res, '获取飞书用户授权失败');
  return res.data;
};

// 获取飞书用户信息
const getFeishuUserInfo = async (userAccessToken: string) => {
  const { data: res } = await axios({
    method: 'GET',
    url: 'https://open.feishu.cn/open-apis/authen/v1/user_info',
    headers: { Authorization: `Bearer ${userAccessToken}` },
  });

  isFeishuAuthorizationFails(res, '获取飞书用户信息失败');

  const userInfo = new FeishuUser();
  userInfo.userId = res.data['user_id'];
  userInfo.avatarBig = res.data['avatar_big'];
  userInfo.avatarMiddle = res.data['avatar_middle'];
  userInfo.avatarThumb = res.data['avatar_thumb'];
  userInfo.avatarUrl = res.data['avatar_url'];
  userInfo.email = res.data['email'];
  userInfo.enName = res.data['en_name'];
  userInfo.mobile = res.data['mobile'];
  userInfo.name = res.data['name'];
  userInfo.openId = res.data['open_id'];
  userInfo.tenantKey = res.data['tenant_key'];
  userInfo.unionId = res.data['union_id'];

  return userInfo;
};

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

  async login(loginUserDto: LoginUserDto) {
    const userInfo = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username: loginUserDto.username })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();

    if (!userInfo) throw new BusinessException({ code: 404, message: '用户不存在' });
    if (userInfo.password !== md5(loginUserDto.password)) throw new BusinessException({ code: 403, message: '密码错误' });

    const userGroupIds = (await this.userUserGroupService.getUserUserGroups(userInfo.id)).map((item) => item.userGroupId);
    const roleIds = (await this.roleUserGroupService.getUserGroupsRoles(userGroupIds)).map((item) => item.roleId);
    const powerIds = (await this.rolePowerService.getRolesPower(roleIds)).map((item) => item.powerId);
    const powers = await this.powerService.findByIds(powerIds);

    return { ...userInfo, powers };
  }

  async bindFeishu(username: string, code: string) {
    const userInfo = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();

    if (!userInfo) throw new BusinessException({ code: 403, message: 'token 失效请重新登录！' });
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

    const userInfo = await this.userRepository
      .createQueryBuilder('user')
      .where('user.feishu.userId = :userId', { userId: feishuUserInfo.userId })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();

    if (!userInfo) throw new BusinessException({ code: 404, message: '飞书用户对应的用户账号不存在' });

    const userGroupIds = (await this.userUserGroupService.getUserUserGroups(userInfo.id)).map((item) => item.userGroupId);
    const roleIds = (await this.roleUserGroupService.getUserGroupsRoles(userGroupIds)).map((item) => item.roleId);
    const powerIds = (await this.rolePowerService.getRolesPower(roleIds)).map((item) => item.powerId);
    const powers = await this.powerService.findByIds(powerIds);

    return { ...userInfo, powers };
  }

  async register(registerUserDto: RegisterUserDto) {
    const userInfo = await this.userRepository.findOneBy({ username: registerUserDto.username });
    if (userInfo) throw new BusinessException({ code: 409, message: '用户已存在' });

    const user = new User();
    user.username = registerUserDto.username;
    user.password = md5(registerUserDto.password);

    await this.userRepository.save(user);
    return '注册成功';
  }

  async findAll(queryUserDto: QueryUserDto) {
    const { username = '', name, currPage = 1, pageSize = 10 } = queryUserDto;
    let qb = await this.userRepository.createQueryBuilder('user').where('user.username like :username', { username: `%${username}%` });

    if (name) qb = qb.andWhere('user.name like :name', { name: `%${name}%` });

    qb = qb.leftJoinAndSelect('user.feishu', 'feishu').orderBy('user.id', 'DESC');

    const res: any = {};
    res.currPage = currPage;
    res.pageSize = pageSize;
    res.total = await qb.getCount();
    res.data = await qb
      .skip((currPage - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return res;
  }

  async findOne(id: number) {
    const data = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();

    if (data == null) throw new BusinessException({ code: 404, message: '用户不存在' });

    return data;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();

    if (data == null) throw new BusinessException({ code: 404, message: '用户不存在' });
    if (data.status === 0) throw new BusinessException({ code: 403, message: '用户已禁用' });
    if ('name' in updateUserDto) data.name = updateUserDto.name;
    return this.userRepository.save(data);
  }

  async updatePassword(id: number, updateUserDto: UpdatePasswordUserDto) {
    const { password } = updateUserDto;
    const data = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();

    if (data == null) throw new BusinessException({ code: 404, message: '用户不存在' });
    if (data.id !== id) throw new BusinessException({ code: 403, message: '权限不足' });
    if (data.status === 0) throw new BusinessException({ code: 403, message: '用户已禁用' });

    data.password = md5(password);
    this.userRepository.save(data);
    return '修改成功';
  }

  async remove(id: number) {
    const data = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .andWhere('user.status = :status', { status: 1 })
      .leftJoinAndSelect('user.feishu', 'feishu')
      .getOne();

    if (data == null) throw new BusinessException({ code: 404, message: '用户不存在' });
    if (data.status === 0) throw new BusinessException({ code: 403, message: '用户已禁用' });

    data.status = 0;
    return this.userRepository.save(data).then(() => '删除成功');
  }
}
