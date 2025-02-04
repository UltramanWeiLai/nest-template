import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity('role_user')
export class RoleUser {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '角色用户关联 ID',
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
    name: 'user_id',
    type: 'int',
    nullable: false,
    unsigned: true,
    comment: '用户 ID',
  })
  userId: number;
}
