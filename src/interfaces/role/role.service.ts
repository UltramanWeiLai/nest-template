import { Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleState } from './entities/role.entity';
import { QueryRoleDto } from './dto/query-role.dto';
import { BusinessException } from '@/exceptions/business/business';
import { RolePowerService } from '../role-power/role-power.service';
import { UpdateRolePowerDto } from './dto/update-role-power.dto';

// 角色不存在
function isRoleNotFound(role: Role) {
  if (!role) throw BusinessException.throwResourceNotFound('角色不存在');
}

// 角色已禁用
function isRoleDisabled(role: Role) {
  if (role.state === RoleState.Disable) throw BusinessException.throwResourceDisabled('角色已禁用');
}

// 角色已存在
function isRoleOccupied(flag: Role | boolean) {
  if (flag) throw BusinessException.throwResourceOccupied('角色已存在');
}

@Injectable()
export class RoleService {
  @Inject(RolePowerService) private rolePowerService: RolePowerService;
  @InjectRepository(Role) private roleRepository: Repository<Role>;

  async create(createRoleDto: CreateRoleDto, username: string) {
    const { parentId, name, description } = createRoleDto;

    isRoleOccupied(await this.roleRepository.findOneBy({ name }));
    if (parentId && !(await this.roleRepository.findOneBy({ id: parentId }))) throw BusinessException.throwResourceNotFound('父级角色不存在');

    const role = new Role();
    role.name = name;
    role.parentId = parentId;
    role.description = description;
    role.create = username;

    return this.roleRepository.save(role);
  }

  async findAll(queryRoleDto: QueryRoleDto) {
    const { name, parentId, currPage = 1, pageSize = 10 } = queryRoleDto;
    const qb = await this.roleRepository.createQueryBuilder('role');

    parentId && qb.andWhere('role.parentId = :parentId', { parentId });
    name && qb.andWhere('role.name like :name', { name: `%${name}%` });
    qb.orderBy('role.id', 'DESC');

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
    const role = await this.roleRepository.findOneBy({ id });

    isRoleNotFound(role);
    isRoleDisabled(role);

    const power = await this.rolePowerService.getRolePower(id);

    return { ...role, power: power.map((item) => item.powerId) };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, username: string) {
    const { parentId, name, description } = updateRoleDto;
    const role = await this.roleRepository.findOneBy({ id });
    const roleName = await this.roleRepository.findOneBy({ name });

    isRoleNotFound(role);
    isRoleOccupied(roleName && roleName.id !== id);
    isRoleDisabled(role);
    if (parentId === role.id) throw new BusinessException({ code: 400, message: '父级角色不能为自身' });

    role.update = username;
    role.name = name;
    role.parentId = parentId;
    role.description = description;

    return this.roleRepository.save(role);
  }

  async updatePower(id: number, updateRolePowerDto: UpdateRolePowerDto) {
    const { power } = updateRolePowerDto;
    const role = await this.roleRepository.findOneBy({ id });

    isRoleNotFound(role);
    isRoleDisabled(role);

    this.rolePowerService.roleBindPowers(id, power);

    return '修改权限成功';
  }

  async enable(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    isRoleNotFound(role);
    if (role.state === RoleState.Enable) return '角色已启用';

    role.state = RoleState.Enable;
    this.roleRepository.save(role);
    return '启用成功';
  }

  async disable(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    isRoleNotFound(role);
    if (role.state === RoleState.Disable) return '角色已禁用';
    role.state = RoleState.Disable;
    this.roleRepository.save(role);

    return '禁用成功';
  }

  async delete(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    isRoleNotFound(role);
    await this.roleRepository.delete(id);

    return '删除成功';
  }
}
