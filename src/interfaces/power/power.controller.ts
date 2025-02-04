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

@ApiTags('权限')
@Controller('power')
@UseGuards(LoginGuard)
export class PowerController {
  @Inject(PowerService) private readonly powerService: PowerService;
  @Inject(WINSTON_LOGGER_TOKEN) private logger: Log;

  @ApiOperation({ summary: '新增权限' })
  @Post()
  create(@Req() request: Request, @Body() createPowerDto: CreatePowerDto) {
    this.logger.info(`新增权限: ${JSON.stringify(createPowerDto)}`, 'create', (request as any).username, 'PowerController');

    return this.powerService.create(createPowerDto, (request as any).username);
  }

  @ApiOperation({ summary: '查询所有权限' })
  @Get()
  findAll(@Req() request: Request, @Query() queryPowerDto: QueryPowerDto) {
    this.logger.info(`查询所有权限`, 'findAll', (request as any).username, 'PowerController');

    return this.powerService.findAll(queryPowerDto);
  }

  @ApiOperation({ summary: '查询单个权限' })
  @Get(':id')
  findOne(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`查询单个权限: ${id}`, 'findOne', (request as any).username, 'PowerController');

    return this.powerService.findOne(+id);
  }

  @ApiOperation({ summary: '修改权限' })
  @Patch(':id')
  update(@Req() request: Request, @Param('id') id: string, @Body() updatePowerDto: UpdatePowerDto) {
    this.logger.info(`修改权限: ${id} ${JSON.stringify(updatePowerDto)}`, 'update', (request as any).username, 'PowerController');

    return this.powerService.update(+id, updatePowerDto, (request as any).username);
  }

  @ApiOperation({ summary: '启用权限' })
  @Patch('enable/:id')
  enable(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`启用权限: ${id}`, 'enable', (request as any).username, 'PowerController');

    return this.powerService.enable(+id);
  }

  @ApiOperation({ summary: '禁用权限' })
  @Patch('disable/:id')
  disable(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`禁用权限: ${id}`, 'disable', (request as any).username, 'PowerController');

    return this.powerService.disable(+id);
  }

  @ApiOperation({ summary: '删除权限' })
  @Delete(':id')
  delete(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`删除权限: ${id}`, 'remove', (request as any).username, 'PowerController');

    return this.powerService.delete(+id);
  }
}
