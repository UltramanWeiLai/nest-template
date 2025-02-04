import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RolePower } from './entities/role-power.entity';

@Injectable()
export class RolePowerService {
  @InjectRepository(RolePower) private readonly rolePowerRepository: Repository<RolePower>;

  // 设置 角色 和 权限的关联关系
  async roleBindPowers(roleId: number, powerIds: number[]) {
    // 删除当前角色的所有权限
    await this.rolePowerRepository.delete({ roleId });

    // 添加新的权限
    const rolePowers = powerIds.map((powerId) => ({ roleId, powerId }));
    return this.rolePowerRepository.save(rolePowers);
  }

  // 批量查询角色的所有权限
  getRolesPower(roleIds: number[]) {
    return this.rolePowerRepository.find({
      where: {
        roleId: In(roleIds),
      },
    });
  }

  // 根据 角色ID 获取 权限ID
  async getRolePower(roleId: number) {
    return this.rolePowerRepository.findBy({ roleId });
  }

  //
  // --------------
  //

  // 设置 权限 和 角色的关联关系
  async powerBindRoles(powerId: number, roleIds: number[]) {
    // 删除当前权限的所有角色
    await this.rolePowerRepository.delete({ powerId });

    // 添加新的角色
    const rolePowers = roleIds.map((roleId) => ({ roleId, powerId }));
    return this.rolePowerRepository.save(rolePowers);
  }

  // 根据 权限ID 获取 角色ID
  async getPowerRole(powerId: number) {
    return this.rolePowerRepository.findBy({ powerId });
  }
}
