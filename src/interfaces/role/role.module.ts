import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleUserModule } from '../role-user/role-user.module';
import { RolePowerModule } from '../role-power/role-power.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), RolePowerModule, RoleUserModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
