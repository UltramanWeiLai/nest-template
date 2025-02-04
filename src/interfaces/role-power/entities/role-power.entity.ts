import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity('role_power')
export class RolePower {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '角色权限关联 ID',
  })
  id: number;

  @Column({
    name: 'role_id',
    type: 'int',
    nullable: false,
    unsigned: true,
    comment: '角色 ID',
  })
  roleId: number;

  @Column({
    name: 'power_id',
    type: 'int',
    nullable: false,
    unsigned: true,
    comment: '权限 ID',
  })
  powerId: number;
}
