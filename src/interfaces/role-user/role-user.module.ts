import { Module } from '@nestjs/common';
import { RoleUserService } from './role-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleUser } from './entities/role-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleUser])],
  providers: [RoleUserService],
  exports: [RoleUserService],
})
export class RoleUserModule {}
