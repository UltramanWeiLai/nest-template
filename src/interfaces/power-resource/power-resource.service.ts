import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PowerResource } from './entities/power-resource.entity';
@Injectable()
export class PowerResourceService {
  @InjectRepository(PowerResource) private readonly powerResourceRepository: Repository<PowerResource>;

  // 批量绑定权限
  async resourceBindPowers(resourceId: number, powerIds: number[]) {
    // 先删除当前资源的所有权限
    await this.powerResourceRepository.delete({ resourceId });

    // 添加新的权限
    const powerResources = powerIds.map((powerId) => ({ resourceId, powerId }));
    return this.powerResourceRepository.save(powerResources);
  }

  // 绑定权限
  async resourceBindPower(resourceId: number, powerId: number) {
    await this.powerResourceRepository.delete({ resourceId, powerId });

    const powerResource = new PowerResource();
    powerResource.resourceId = resourceId;
    powerResource.powerId = powerId;

    return this.powerResourceRepository.save(powerResource);
  }

  // 查询某个资源的所有权限
  getPowers(resourceId: number) {
    return this.powerResourceRepository.find({
      where: {
        resourceId,
      },
    });
  }

  //
  // --------------
  //

  // 批量绑定资源
  async powerBindResources(powerId: number, resourceIds: number[]) {
    // 先删除当前权限的所有资源
    await this.powerResourceRepository.delete({ powerId });

    // 添加新的资源
    const powerResources = resourceIds.map((resourceId) => ({ resourceId, powerId }));
    return this.powerResourceRepository.save(powerResources);
  }

  // 绑定资源
  async powerBindResource(powerId: number, resourceId: number) {
    await this.powerResourceRepository.delete({ powerId, resourceId });

    const powerResource = new PowerResource();
    powerResource.resourceId = resourceId;
    powerResource.powerId = powerId;

    return this.powerResourceRepository.save(powerResource);
  }

  // 查询某个权限的所有资源
  getResources(powerId: number) {
    return this.powerResourceRepository.find({
      where: {
        powerId,
      },
    });
  }
}
