import { Module } from '@nestjs/common';
import { UserGroupService } from './user-group.service';
import { UserGroupController } from './user-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroup } from './entities/user-group.entity';
import { RoleUserGroupModule } from '../role-user-group/role-user-group.module';
import { UserUserGroupModule } from '../user-user-group/user-user-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserGroup]), RoleUserGroupModule, UserUserGroupModule],
  controllers: [UserGroupController],
  providers: [UserGroupService],
})
export class UserGroupModule {}
