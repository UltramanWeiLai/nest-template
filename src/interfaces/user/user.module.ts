import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FeishuUser } from './entities/feishu-user.entity';
import { RoleUserGroupModule } from '../role-user-group/role-user-group.module';
import { UserUserGroupModule } from '../user-user-group/user-user-group.module';
import { RolePowerModule } from '../role-power/role-power.module';
import { PowerModule } from '../power/power.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([FeishuUser]), RoleUserGroupModule, UserUserGroupModule, RolePowerModule, PowerModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
