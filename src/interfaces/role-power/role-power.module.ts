import { Module } from '@nestjs/common';
import { RolePowerService } from './role-power.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePower } from './entities/role-power.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RolePower])],
  providers: [RolePowerService],
  exports: [RolePowerService],
})
export class RolePowerModule {}
