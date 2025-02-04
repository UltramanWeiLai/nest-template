import { Module } from '@nestjs/common';
import { RoleUserGroupService } from './role-user-group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleUserGroup } from './entities/role-user-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleUserGroup])],
  providers: [RoleUserGroupService],
  exports: [RoleUserGroupService],
})
export class RoleUserGroupModule {}
