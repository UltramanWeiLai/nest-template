import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity('user_user_group')
export class UserUserGroup {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '用户用户组关联表 ID',
  })
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: false,
    unsigned: true,
    comment: '用户 ID',
  })
  userId: number;

  @Column({
    name: 'user_group_id',
    type: 'int',
    nullable: false,
    unsigned: true,
    comment: '用户组 ID',
  })
  userGroupId: number;
}
