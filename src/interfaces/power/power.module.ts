import { Module } from '@nestjs/common';
import { PowerService } from './power.service';
import { PowerController } from './power.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Power } from './entities/power.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Power])],
  controllers: [PowerController],
  providers: [PowerService],
  exports: [PowerService],
})
export class PowerModule {}
