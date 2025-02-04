import { PrimaryGeneratedColumn, Column } from 'typeorm';

export class PowerResource {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '权限资源表 ID',
  })
  id: number;

  @Column({
    name: 'power_id',
    type: 'int',
    nullable: false,
    unsigned: true,
    comment: '权限 ID',
  })
  powerId: number;

  @Column({
    name: 'resource_id',
    type: 'int',
    nullable: false,
    unsigned: true,
    comment: '资源 ID',
  })
  resourceId: number;
}
