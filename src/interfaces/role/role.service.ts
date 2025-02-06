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
/**
 * 检查角色是否不存在
 * @param {Role} role - 要检查的角色对象
 * @throws {BusinessException} 如果角色不存在则抛出异常
 */
function isRoleNotFound(role: Role) {
  if (!role) throw BusinessException.throwResourceNotFound('角色不存在');
}

/**
 * 检查角色是否已禁用
 * @param {Role} role - 要检查的角色对象
 * @throws {BusinessException} 如果角色已禁用则抛出异常
 */
function isRoleDisabled(role: Role) {
  if (role.state === RoleState.Disable) throw BusinessException.throwResourceDisabled('角色已禁用');
}

/**
 * 检查角色是否已存在
 * @param {Role | boolean} flag - 要检查的角色对象或标志
 * @throws {BusinessException} 如果角色已存在则抛出异常
 */
function isRoleOccupied(flag: Role | boolean) {
  if (flag) throw BusinessException.throwResourceOccupied('角色已存在');
}

/**
 * 角色服务类
 * @description 提供角色的创建、查询、更新、启用、禁用和删除等功能
 */
@Injectable()
export class RoleService {
  @Inject(RolePowerService) private rolePowerService: RolePowerService;
  @InjectRepository(Role) private roleRepository: Repository<Role>;

  /**
   * 创建新角色
   * @param {CreateRoleDto} createRoleDto - 创建角色的数据传输对象
   * @param {string} username - 创建者用户名
   * @returns {Promise<Role>} 返回创建的角色对象
   * @throws {BusinessException} 如果角色已存在或父级角色不存在则抛出异常
   */
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

  /**
   * 查询角色列表
   * @param {QueryRoleDto} queryRoleDto - 查询角色的数据传输对象
   * @returns {Promise<{currPage: number, pageSize: number, total: number, data: Role[]}>} 返回分页的角色列表
   */
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

  /**
   * 查询单个角色
   * @param {number} id - 角色ID
   * @returns {Promise<Role & { power: number[] }>} 返回角色信息及其权限ID列表
   * @throws {BusinessException} 如果角色不存在或已禁用则抛出异常
   */
  async findOne(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    isRoleNotFound(role);
    isRoleDisabled(role);

    const power = await this.rolePowerService.getRolePower(id);

    return { ...role, power: power.map((item) => item.powerId) };
  }

  /**
   * 更新角色信息
   * @param {number} id - 角色ID
   * @param {UpdateRoleDto} updateRoleDto - 更新角色的数据传输对象
   * @param {string} username - 更新者用户名
   * @returns {Promise<Role>} 返回更新后的角色对象
   * @throws {BusinessException} 如果角色不存在、已被占用、已禁用或父级角色设置无效则抛出异常
   */
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

  /**
   * 更新角色权限
   * @param {number} id - 角色ID
   * @param {UpdateRolePowerDto} updateRolePowerDto - 更新角色权限的数据传输对象
   * @returns {Promise<string>} 返回更新成功消息
   * @throws {BusinessException} 如果角色不存在或已禁用则抛出异常
   */
  async updatePower(id: number, updateRolePowerDto: UpdateRolePowerDto) {
    const { power } = updateRolePowerDto;
    const role = await this.roleRepository.findOneBy({ id });

    isRoleNotFound(role);
    isRoleDisabled(role);

    this.rolePowerService.roleBindPowers(id, power);

    return '修改权限成功';
  }

  /**
   * 启用角色
   * @param {number} id - 角色ID
   * @returns {Promise<string>} 返回操作结果消息
   * @throws {BusinessException} 如果角色不存在则抛出异常
   */
  async enable(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    isRoleNotFound(role);
    if (role.state === RoleState.Enable) return '角色已启用';

    role.state = RoleState.Enable;
    this.roleRepository.save(role);
    return '启用成功';
  }

  /**
   * 禁用角色
   * @param {number} id - 角色ID
   * @returns {Promise<string>} 返回操作结果消息
   * @throws {BusinessException} 如果角色不存在则抛出异常
   */
  async disable(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    isRoleNotFound(role);
    if (role.state === RoleState.Disable) return '角色已禁用';
    role.state = RoleState.Disable;
    this.roleRepository.save(role);

    return '禁用成功';
  }

  /**
   * 删除角色
   * @param {number} id - 角色ID
   * @returns {Promise<string>} 返回删除成功消息
   * @throws {BusinessException} 如果角色不存在则抛出异常
   */
  async delete(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    isRoleNotFound(role);
    await this.roleRepository.delete(id);

    return '删除成功';
  }
}
