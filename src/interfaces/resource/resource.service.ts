import { Injectable } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { QueryResourceDto } from './dto/query-resource.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource, ResourceState } from './entities/resource.entity';
import { BusinessException } from '@/exceptions/business/business';

/**
 * 检查资源是否不存在
 * @param {Resource} resource - 要检查的资源对象
 * @throws {BusinessException} 如果资源不存在则抛出异常
 */
function isResourceNotFound(resource: Resource) {
  if (!resource) throw BusinessException.throwResourceNotFound('资源不存在');
}

/**
 * 检查资源是否已禁用
 * @param {Resource} resource - 要检查的资源对象
 * @throws {BusinessException} 如果资源已禁用则抛出异常
 */
function isResourceDisabled(resource: Resource) {
  if (resource.state === ResourceState.Disable) throw BusinessException.throwResourceDisabled('资源已禁用');
}

/**
 * 检查资源是否已被占用
 * @param {unknown} resource - 要检查的资源对象
 * @throws {BusinessException} 如果资源已被占用则抛出异常
 */
function isResourceOccupied(resource: unknown) {
  if (resource) throw BusinessException.throwResourceOccupied('资源已占用');
}

/**
 * 资源服务类
 * @class ResourceService
 * @description 提供资源的创建、查询、更新、启用、禁用和删除等功能
 */
@Injectable()
export class ResourceService {
  @InjectRepository(Resource) private readonly resourceRepository: Repository<Resource>;

  /**
   * 创建新资源
   * @param {CreateResourceDto} createResourceDto - 创建资源的数据传输对象
   * @param {string} username - 创建者用户名
   * @returns {Promise<Resource>} 返回创建的资源对象
   * @throws {BusinessException} 如果资源已存在则抛出异常
   */
  async create(createResourceDto: CreateResourceDto, username: string) {
    const { name, key, description } = createResourceDto;

    isResourceOccupied(await this.resourceRepository.findOneBy({ key }));

    const resource = new Resource();
    resource.key = key;
    resource.name = name;
    resource.description = description;
    resource.create = username;
    return await this.resourceRepository.save(resource);
  }

  /**
   * 查询资源列表
   * @param {QueryResourceDto} queryResourceDto - 查询资源的数据传输对象
   * @returns {Promise<{currPage: number, pageSize: number, total: number, data: Resource[]}>} 返回分页的资源列表
   */
  async findAll(queryResourceDto: QueryResourceDto) {
    const { name, key, currPage, pageSize } = queryResourceDto;
    const query = this.resourceRepository.createQueryBuilder('resource');

    name && query.andWhere('resource.name like :name', { name: `%${name}%` });
    key && query.andWhere('resource.key like :key', { key: `%${key}%` });

    const res: Record<string, unknown> = { currPage, pageSize };
    res.total = await query.getCount();
    res.data = await query
      .skip((currPage - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return res;
  }

  /**
   * 查询单个资源
   * @param {number} id - 资源ID
   * @returns {Promise<Resource>} 返回查询到的资源对象
   * @throws {BusinessException} 如果资源不存在则抛出异常
   */
  async findOne(id: number) {
    const resource = await this.resourceRepository.findOneBy({ id });
    isResourceNotFound(resource);
    return resource;
  }

  /**
   * 更新资源信息
   * @param {number} id - 资源ID
   * @param {UpdateResourceDto} updateResourceDto - 更新资源的数据传输对象
   * @param {string} username - 更新者用户名
   * @returns {Promise<Resource>} 返回更新后的资源对象
   * @throws {BusinessException} 如果资源不存在、已被占用或已禁用则抛出异常
   */
  async update(id: number, updateResourceDto: UpdateResourceDto, username: string) {
    const { name, key, description } = updateResourceDto;
    const resource = await this.resourceRepository.findOneBy({ id });
    const resourceKey = await this.resourceRepository.findOneBy({ key });

    isResourceNotFound(resource);
    isResourceOccupied(resourceKey && resourceKey.id !== id);
    isResourceDisabled(resource);

    resource.key = key;
    resource.name = name;
    resource.description = description;
    resource.update = username;

    return await this.resourceRepository.save(resource);
  }

  /**
   * 启用资源
   * @param {number} id - 资源ID
   * @param {string} username - 操作者用户名
   * @returns {Promise<string>} 返回操作结果消息
   * @throws {BusinessException} 如果资源不存在则抛出异常
   */
  async enable(id: number, username: string) {
    const resource = await this.resourceRepository.findOneBy({ id });

    isResourceNotFound(resource);
    if (resource.state === ResourceState.Enable) return '资源已启用';

    resource.state = ResourceState.Enable;
    resource.update = username;
    await this.resourceRepository.save(resource);
    return '启用成功';
  }

  /**
   * 禁用资源
   * @param {number} id - 资源ID
   * @param {string} username - 操作者用户名
   * @returns {Promise<string>} 返回操作结果消息
   * @throws {BusinessException} 如果资源不存在则抛出异常
   */
  async disable(id: number, username: string) {
    const resource = await this.resourceRepository.findOneBy({ id });

    isResourceNotFound(resource);
    if (resource.state === ResourceState.Disable) return '资源已禁用';

    resource.state = ResourceState.Disable;
    resource.update = username;
    await this.resourceRepository.save(resource);
    return '禁用成功';
  }

  /**
   * 删除资源
   * @param {number} id - 资源ID
   * @returns {Promise<any>} 返回删除操作结果
   * @throws {BusinessException} 如果资源不存在则抛出异常
   */
  async delete(id: number) {
    const resource = await this.resourceRepository.findOneBy({ id });
    isResourceNotFound(resource);
    return await this.resourceRepository.delete(id);
  }
}
