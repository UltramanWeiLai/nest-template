import { Injectable } from '@nestjs/common';
import { CreatePowerDto } from './dto/create-power.dto';
import { UpdatePowerDto } from './dto/update-power.dto';
import { Power, PowerState } from './entities/power.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QueryPowerDto } from './dto/query-power.dto';
import { BusinessException } from '@/exceptions/business/business';

/**
 * 检查权限是否不存在
 * @param {Power} power - 要检查的权限对象
 * @throws {BusinessException} 如果权限不存在则抛出异常
 */
function isPowerNotFound(power: Power) {
  if (!power) throw BusinessException.throwResourceNotFound('权限不存在');
}

/**
 * 检查权限是否已禁用
 * @param {Power} power - 要检查的权限对象
 * @throws {BusinessException} 如果权限已禁用则抛出异常
 */
function isPowerDisabled(power: Power) {
  if (power.state === PowerState.Disable) throw BusinessException.throwPermissionDisabled('权限已禁用');
}

/**
 * 权限服务类
 * @description 提供权限的创建、查询、更新、启用、禁用和删除等功能
 */
@Injectable()
export class PowerService {
  @InjectRepository(Power) private powerRepository: Repository<Power>;

  /**
   * 创建新权限
   * @param {CreatePowerDto} createPowerDto - 创建权限的数据传输对象
   * @param {string} username - 创建者用户名
   * @returns {Promise<Power>} 返回创建的权限对象
   */
  create(createPowerDto: CreatePowerDto, username: string) {
    const { name, action, resourceKey, description } = createPowerDto;

    const power = new Power();
    power.name = name;
    power.action = action;
    power.resourceKey = resourceKey;
    power.description = description;
    power.create = username;

    return this.powerRepository.save(power);
  }

  /**
   * 查询权限列表
   * @param {QueryPowerDto} queryPowerDto - 查询权限的数据传输对象
   * @returns {Promise<{currPage: number, pageSize: number, total: number, data: Power[]}>} 返回分页的权限列表
   */
  async findAll(queryPowerDto: QueryPowerDto) {
    const { name, action, resourceKey, currPage = 1, pageSize = 10 } = queryPowerDto;
    const qb = await this.powerRepository.createQueryBuilder('power');

    name && qb.andWhere('power.name like :name', { name: `%${name}%` });
    action && qb.andWhere('power.action = :action', { action });
    resourceKey && qb.andWhere('power.resourceKey like :resourceKey', { resourceKey: `%${resourceKey}%` });

    qb.orderBy('power.createTime', 'DESC');

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

  /**
   * 查询单个权限
   * @param {number} id - 权限ID
   * @returns {Promise<Power>} 返回查询到的权限对象
   * @throws {BusinessException} 如果权限不存在或已禁用则抛出异常
   */
  async findOne(id: number) {
    const power = await this.powerRepository.findOneBy({ id });

    isPowerNotFound(power);
    isPowerDisabled(power);

    return power;
  }

  /**
   * 更新权限信息
   * @param {number} id - 权限ID
   * @param {UpdatePowerDto} updatePowerDto - 更新权限的数据传输对象
   * @param {string} username - 更新者用户名
   * @returns {Promise<Power>} 返回更新后的权限对象
   * @throws {BusinessException} 如果权限不存在或已禁用则抛出异常
   */
  async update(id: number, updatePowerDto: UpdatePowerDto, username: string) {
    const power = await this.powerRepository.findOneBy({ id });
    const { name, action, resourceKey, description } = updatePowerDto;

    isPowerNotFound(power);
    isPowerDisabled(power);

    power.name = name;
    power.action = action;
    power.resourceKey = resourceKey;
    power.description = description;
    power.update = username;

    return this.powerRepository.save(power);
  }

  /**
   * 启用权限
   * @param {number} id - 权限ID
   * @returns {Promise<string>} 返回操作结果消息
   * @throws {BusinessException} 如果权限不存在则抛出异常
   */
  async enable(id: number) {
    const power = await this.powerRepository.findOneBy({ id });

    isPowerNotFound(power);
    if (power.state === PowerState.Enable) return '权限已启用';

    power.state = PowerState.Enable;
    this.powerRepository.save(power);
    return '启用成功';
  }

  /**
   * 禁用权限
   * @param {number} id - 权限ID
   * @returns {Promise<string>} 返回操作结果消息
   * @throws {BusinessException} 如果权限不存在则抛出异常
   */
  async disable(id: number) {
    const power = await this.powerRepository.findOneBy({ id });

    isPowerNotFound(power);
    if (power.state === PowerState.Disable) return '权限已禁用';

    power.state = PowerState.Disable;
    this.powerRepository.save(power);
    return '禁用成功';
  }

  /**
   * 删除权限
   * @param {number} id - 权限ID
   * @returns {Promise<string>} 返回删除操作结果
   * @throws {BusinessException} 如果权限不存在则抛出异常
   */
  async delete(id: number) {
    const power = await this.powerRepository.findOneBy({ id });

    isPowerNotFound(power);
    this.powerRepository.delete(id);

    return '删除成功';
  }

  // -------------

  /**
   * 根据权限ID批量查询权限数据
   * @param {number[]} ids - 权限ID数组
   * @returns {Promise<Power[]>} 返回权限对象数组
   */
  async findByIds(ids: number[]) {
    return this.powerRepository.findBy({ id: In(ids) });
  }
}
