import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, Req, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Log } from '@/logger/log';
import { WINSTON_LOGGER_TOKEN } from '@/logger/winston.module';
import { LoginGuard } from '@/guard/login/login-check.guard';
import { Request } from 'express';
import { createHash } from 'crypto';

import { UserService } from './user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { LoginFeishuUserDto } from './dto/login-feishu-user.dto';
import { UpdatePasswordUserDto } from './dto/update-password-user.dto';
import { BusinessException } from '@/exceptions/business/business';

@ApiTags('用户')
@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Inject(WINSTON_LOGGER_TOKEN)
  private readonly logger: Log;

  @ApiOperation({ summary: '登录' })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    this.logger.info(`登录用户: ${JSON.stringify(loginUserDto)}`, 'login', loginUserDto.username, 'UserService');

    // 特殊机制 管理员账号
    if (loginUserDto.username === 'orb.tong' && loginUserDto.password === 'asd123456') {
      const token = this.jwtService.sign({ id: '10086', username: loginUserDto.username });
      return { token, userInfo: { id: '10086', username: loginUserDto.username, name: '管理员' } };
    }

    const userInfo = await this.userService.login(loginUserDto);
    const token = this.jwtService.sign({ id: userInfo.id, username: userInfo.username });
    return { token, userInfo };
  }

  @ApiOperation({ summary: '绑定飞书账号' })
  @Post('bind/feishu')
  @UseGuards(LoginGuard)
  async bindFeishu(@Req() request: Request, @Body() loginFeishuUserDto: LoginFeishuUserDto) {
    const { code } = loginFeishuUserDto;
    this.logger.info(`绑定飞书账号: ${code}`, 'bindFeishu', (request as any).username, 'UserService');

    return this.userService.bindFeishu((request as any).username, code);
  }

  @ApiOperation({ summary: '飞书授权登陆' })
  @Post('login/feishu')
  async loginFeishu(@Body() loginFeishuUserDto: LoginFeishuUserDto) {
    const { code } = loginFeishuUserDto;
    this.logger.info(`飞书授权: ${code}`, 'loginFeishu', code, 'UserService');

    const userInfo = await this.userService.loginFeishu(code);
    const token = this.jwtService.sign({ id: userInfo.id, username: userInfo.username });

    // 获取当前时间戳
    const ctime = new Date().getTime();
    const key = 'kztvmh95b84w3snq9fdsinfpcumyoeyv';
    const sign = createHash('md5').update(`${ctime}${userInfo.feishu.userId}${key}`).digest('hex');

    return { token, userInfo, sign, ctime };
  }

  @ApiOperation({ summary: '注册' })
  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    this.logger.info(`创建用户: ${JSON.stringify(registerUserDto)}`, 'create', registerUserDto.username, 'UserService');

    return this.userService.register(registerUserDto);
  }

  @ApiOperation({ summary: '查询用户' })
  @Get()
  @UseGuards(LoginGuard)
  findAll(@Req() request: Request, @Query() queryUserDto: QueryUserDto) {
    this.logger.info(`查询用户: ${JSON.stringify(queryUserDto)}`, 'findAll', (request as any).username, 'UserService');

    return this.userService.findAll(queryUserDto);
  }

  @ApiOperation({ summary: '查询用户详情' })
  @Get(':id')
  @UseGuards(LoginGuard)
  findOne(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`查询用户: ${id}`, 'findOne', (request as any).username, 'UserService');

    return this.userService.findOne(+id);
  }

  @ApiOperation({ summary: '更新用户' })
  @Patch(':id')
  @UseGuards(LoginGuard)
  update(@Req() request: Request, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.info(`更新用户: ${JSON.stringify(updateUserDto)}`, 'update', (request as any).username, 'UserService');

    return this.userService.update(+id, updateUserDto);
  }

  @ApiOperation({ summary: '修改密码' })
  @Patch('password/:id')
  @UseGuards(LoginGuard)
  updatePassword(@Req() request: Request, @Param('id') id: string, @Body() updateUserDto: UpdatePasswordUserDto) {
    this.logger.info(`修改密码: ${JSON.stringify(updateUserDto)}`, 'updatePassword', (request as any).username, 'UserService');
    if ((request as any).username !== updateUserDto.username) throw BusinessException.throwAccessForbidden();

    return this.userService.updatePassword(+id, updateUserDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @Delete(':id')
  @UseGuards(LoginGuard)
  remove(@Req() request: Request, @Param('id') id: string) {
    this.logger.info(`删除用户: ${id}`, 'remove', (request as any).username, 'UserService');
    return this.userService.remove(+id);
  }
}
