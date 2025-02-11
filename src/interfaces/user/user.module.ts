import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FeishuUser } from './entities/feishu-user.entity';
import { RoleModule } from '../role/role.module';
import { RoleUserModule } from '../role-user/role-user.module';
import { RolePowerModule } from '../role-power/role-power.module';
import { RoleUserGroupModule } from '../role-user-group/role-user-group.module';
import { UserGroupModule } from '../user-group/user-group.module';
import { UserUserGroupModule } from '../user-user-group/user-user-group.module';
import { PowerModule } from '../power/power.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([FeishuUser]),
    RoleModule,
    RoleUserModule,
    RolePowerModule,
    RoleUserGroupModule,
    UserGroupModule,
    UserUserGroupModule,
    PowerModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
