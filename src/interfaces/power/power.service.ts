import { Injectable } from '@nestjs/common';
import { CreatePowerDto } from './dto/create-power.dto';
import { UpdatePowerDto } from './dto/update-power.dto';
import { Power, PowerState } from './entities/power.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QueryPowerDto } from './dto/query-power.dto';
import { BusinessException } from '@/exceptions/business/business';

// 权限不存在
function isPowerNotFound(power: Power) {
  if (!power) throw BusinessException.throwResourceNotFound('权限不存在');
}
// 权限已禁用
function isPowerDisabled(power: Power) {
  if (power.state === PowerState.Disable) throw BusinessException.throwPermissionDisabled('权限已禁用');
}

@Injectable()
export class PowerService {
  @InjectRepository(Power) private powerRepository: Repository<Power>;

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

  async findOne(id: number) {
    const power = await this.powerRepository.findOneBy({ id });

    isPowerNotFound(power);
    isPowerDisabled(power);

    return power;
  }

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

  async enable(id: number) {
    const power = await this.powerRepository.findOneBy({ id });

    isPowerNotFound(power);
    if (power.state === PowerState.Enable) return '权限已启用';

    power.state = PowerState.Enable;
    this.powerRepository.save(power);
    return '启用成功';
  }

  async disable(id: number) {
    const power = await this.powerRepository.findOneBy({ id });

    isPowerNotFound(power);
    if (power.state === PowerState.Disable) return '权限已禁用';

    power.state = PowerState.Disable;
    this.powerRepository.save(power);
    return '禁用成功';
  }

  async delete(id: number) {
    const power = await this.powerRepository.findOneBy({ id });

    isPowerNotFound(power);
    this.powerRepository.delete(id);

    return '删除成功';
  }

  // -------------

  // 根据 权限id 批量查询权限数据
  async findByIds(ids: number[]) {
    return this.powerRepository.findBy({ id: In(ids) });
  }
}
