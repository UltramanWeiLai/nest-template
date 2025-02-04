import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Req, Query, UseGuards } from '@nestjs/common';
import { Log } from '@/logger/log';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { WINSTON_LOGGER_TOKEN } from '@/logger/winston.module';
import { QueryResourceDto } from './dto/query-resource.dto';
import { LoginGuard } from '@/guard/login/login-check.guard';

@ApiTags('资源')
@Controller('resource')
@UseGuards(LoginGuard)
export class ResourceController {
  @Inject(ResourceService) private readonly resourceService: ResourceService;
  @Inject(WINSTON_LOGGER_TOKEN) private logger: Log;

  @ApiOperation({ summary: '新增资源' })
  @Post()
  create(@Req() request: Request, @Body() createResourceDto: CreateResourceDto) {
    this.logger.info(`新增资源: ${JSON.stringify(createResourceDto)}`, 'create', (request as any).username, 'ResourceController');

    return this.resourceService.create(createResourceDto, (request as any).username);
  }

  @ApiOperation({ summary: '查询资源' })
  @Get()
  findAll(@Req() request: Request, @Query() queryResourceDto: QueryResourceDto) {
    this.logger.info(`查询所有资源: ${JSON.stringify(queryResourceDto)}`, 'findAll', (request as any).username, 'ResourceController');

    return this.resourceService.findAll(queryResourceDto);
  }

  @ApiOperation({ summary: '资源详情' })
  @Get(':id')
  findOne(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`查询单个资源: ${id}`, 'findOne', (request as any).username, 'ResourceController');

    return this.resourceService.findOne(+id);
  }

  @ApiOperation({ summary: '更新资源' })
  @Patch(':id')
  update(@Req() request: Request, @Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
    this.logger.info(`修改资源: ${id} ${JSON.stringify(updateResourceDto)}`, 'update', (request as any).username, 'ResourceController');

    return this.resourceService.update(+id, updateResourceDto, (request as any).username);
  }

  @ApiOperation({ summary: '启用资源' })
  @Patch('enable/:id')
  enable(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`启用资源: ${id}`, 'enable', (request as any).username, 'ResourceController');

    return this.resourceService.enable(+id, (request as any).username);
  }

  @ApiOperation({ summary: '禁用资源' })
  @Patch('disable/:id')
  disable(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`禁用资源: ${id}`, 'disable', (request as any).username, 'ResourceController');

    return this.resourceService.disable(+id, (request as any).username);
  }

  @ApiOperation({ summary: '删除资源' })
  @Delete(':id')
  delete(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`删除资源: ${id}`, 'remove', (request as any).username, 'ResourceController');

    return this.resourceService.delete(+id);
  }
}
