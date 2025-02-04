import { Injectable } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { QueryResourceDto } from './dto/query-resource.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource, ResourceState } from './entities/resource.entity';
import { BusinessException } from '@/exceptions/business/business';

// 资源不存在
function isResourceExist(resource: Resource) {
  if (!resource) throw BusinessException.throwResourceNotFound('资源不存在');
}

// 资源已禁用
function isResourceDisabled(resource: Resource) {
  if (resource.state === ResourceState.Disable) throw BusinessException.throwResourceDisabled('资源已禁用');
}

// 资源已占用
function isResourceOccupied(resource: unknown) {
  if (resource) throw BusinessException.throwResourceOccupied('资源已占用');
}

@Injectable()
export class ResourceService {
  @InjectRepository(Resource) private readonly resourceRepository: Repository<Resource>;

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

  async findAll(queryResourceDto: QueryResourceDto) {
    const { name, key, currPage, pageSize } = queryResourceDto;
    const query = this.resourceRepository.createQueryBuilder('resource');

    name && query.andWhere('resource.name like :name', { name: `%${name}%` });
    key && query.andWhere('resource.key like :key', { key: `%${key}%` });

    const res: any = {};
    res.currPage = currPage;
    res.pageSize = pageSize;
    res.total = await query.getCount();
    res.data = await query
      .skip((currPage - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return res;
  }

  async findOne(id: number) {
    const resource = await this.resourceRepository.findOneBy({ id });
    isResourceExist(resource);
    return resource;
  }

  async update(id: number, updateResourceDto: UpdateResourceDto, username: string) {
    const { name, key, description } = updateResourceDto;
    const resource = await this.resourceRepository.findOneBy({ id });
    const resourceKey = await this.resourceRepository.findOneBy({ key });

    isResourceExist(resource);
    isResourceOccupied(resourceKey && resourceKey.id !== id);
    isResourceDisabled(resource);

    resource.key = key;
    resource.name = name;
    resource.description = description;
    resource.update = username;

    return await this.resourceRepository.save(resource);
  }

  async enable(id: number, username: string) {
    const resource = await this.resourceRepository.findOneBy({ id });

    isResourceExist(resource);
    if (resource.state === ResourceState.Enable) return '资源已启用';

    resource.state = ResourceState.Enable;
    resource.update = username;
    await this.resourceRepository.save(resource);
    return '启用成功';
  }

  async disable(id: number, username: string) {
    const resource = await this.resourceRepository.findOneBy({ id });

    isResourceExist(resource);
    if (resource.state === ResourceState.Disable) return '资源已禁用';

    resource.state = ResourceState.Disable;
    resource.update = username;
    await this.resourceRepository.save(resource);
    return '禁用成功';
  }

  async delete(id: number) {
    const resource = await this.resourceRepository.findOneBy({ id });
    isResourceExist(resource);
    return await this.resourceRepository.delete(id);
  }
}
