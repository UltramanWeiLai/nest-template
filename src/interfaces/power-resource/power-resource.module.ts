import { Module } from '@nestjs/common';
import { PowerResourceService } from './power-resource.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PowerResource } from './entities/power-resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PowerResource])],
  providers: [PowerResourceService],
  exports: [PowerResourceService],
})
export class PowerResourceModule {}
