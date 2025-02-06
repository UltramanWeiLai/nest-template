import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Inject, Req, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginGuard } from '@/guard/login/login-check.guard';
import { WINSTON_LOGGER_TOKEN } from '@/logger/winston.module';
import { Log } from '@/logger/log';
import { PowerService } from './power.service';
import { CreatePowerDto } from './dto/create-power.dto';
import { UpdatePowerDto } from './dto/update-power.dto';
import { QueryPowerDto } from './dto/query-power.dto';

/**
 * 权限控制器
 * @description 提供权限相关的 HTTP 接口，包括权限的创建、查询、修改、启用、禁用和删除等功能
 * @class
 */
@ApiTags('权限')
@Controller('power')
@UseGuards(LoginGuard)
export class PowerController {
  @Inject(PowerService) private readonly powerService: PowerService;
  @Inject(WINSTON_LOGGER_TOKEN) private logger: Log;

  /**
   * 创建新权限
   * @description 创建一个新的权限记录
   * @param {Request} request - Express 请求对象，包含用户信息
   * @param {CreatePowerDto} createPowerDto - 创建权限的数据传输对象
   * @returns {Promise<Power>} 返回创建的权限对象
   */
  @ApiOperation({ summary: '新增权限' })
  @Post()
  create(@Req() request: Request, @Body() createPowerDto: CreatePowerDto) {
    this.logger.info(`新增权限: ${JSON.stringify(createPowerDto)}`, 'create', (request as any).username, 'PowerController');

    return this.powerService.create(createPowerDto, (request as any).username);
  }

  /**
   * 查询权限列表
   * @description 根据查询条件获取权限列表，支持分页和条件筛选
   * @param {Request} request - Express 请求对象，包含用户信息
   * @param {QueryPowerDto} queryPowerDto - 查询权限的数据传输对象
   * @returns {Promise<{currPage: number, pageSize: number, total: number, data: Power[]}>} 返回分页的权限列表
   */
  @ApiOperation({ summary: '查询所有权限' })
  @Get()
  findAll(@Req() request: Request, @Query() queryPowerDto: QueryPowerDto) {
    this.logger.info(`查询所有权限`, 'findAll', (request as any).username, 'PowerController');

    return this.powerService.findAll(queryPowerDto);
  }

  /**
   * 查询单个权限
   * @description 根据权限ID获取权限详细信息
   * @param {Request} request - Express 请求对象，包含用户信息
   * @param {string} id - 权限ID
   * @returns {Promise<Power>} 返回权限对象
   * @throws {BusinessException} 当权限不存在或已禁用时抛出异常
   */
  @ApiOperation({ summary: '查询单个权限' })
  @Get(':id')
  findOne(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`查询单个权限: ${id}`, 'findOne', (request as any).username, 'PowerController');

    return this.powerService.findOne(+id);
  }

  /**
   * 更新权限信息
   * @description 根据权限ID更新权限信息
   * @param {Request} request - Express 请求对象，包含用户信息
   * @param {string} id - 权限ID
   * @param {UpdatePowerDto} updatePowerDto - 更新权限的数据传输对象
   * @returns {Promise<Power>} 返回更新后的权限对象
   * @throws {BusinessException} 当权限不存在或已禁用时抛出异常
   */
  @ApiOperation({ summary: '修改权限' })
  @Patch(':id')
  update(@Req() request: Request, @Param('id') id: string, @Body() updatePowerDto: UpdatePowerDto) {
    this.logger.info(`修改权限: ${id} ${JSON.stringify(updatePowerDto)}`, 'update', (request as any).username, 'PowerController');

    return this.powerService.update(+id, updatePowerDto, (request as any).username);
  }

  /**
   * 启用权限
   * @description 将指定权限的状态设置为启用
   * @param {Request} request - Express 请求对象，包含用户信息
   * @param {string} id - 权限ID
   * @returns {Promise<string>} 返回操作结果消息
   * @throws {BusinessException} 当权限不存在时抛出异常
   */
  @ApiOperation({ summary: '启用权限' })
  @Patch('enable/:id')
  enable(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`启用权限: ${id}`, 'enable', (request as any).username, 'PowerController');

    return this.powerService.enable(+id);
  }

  /**
   * 禁用权限
   * @description 将指定权限的状态设置为禁用
   * @param {Request} request - Express 请求对象，包含用户信息
   * @param {string} id - 权限ID
   * @returns {Promise<string>} 返回操作结果消息
   * @throws {BusinessException} 当权限不存在时抛出异常
   */
  @ApiOperation({ summary: '禁用权限' })
  @Patch('disable/:id')
  disable(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`禁用权限: ${id}`, 'disable', (request as any).username, 'PowerController');

    return this.powerService.disable(+id);
  }

  /**
   * 删除权限
   * @description 删除指定的权限记录
   * @param {Request} request - Express 请求对象，包含用户信息
   * @param {string} id - 权限ID
   * @returns {Promise<string>} 返回删除操作结果
   * @throws {BusinessException} 当权限不存在时抛出异常
   */
  @ApiOperation({ summary: '删除权限' })
  @Delete(':id')
  delete(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`删除权限: ${id}`, 'remove', (request as any).username, 'PowerController');

    return this.powerService.delete(+id);
  }
}
