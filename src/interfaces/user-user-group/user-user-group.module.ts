import { Module } from '@nestjs/common';
import { UserUserGroupService } from './user-user-group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserUserGroup } from './entities/user-user-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserUserGroup])],
  providers: [UserUserGroupService],
  exports: [UserUserGroupService],
})
export class UserUserGroupModule {}
