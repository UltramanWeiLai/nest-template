import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('role_user_group')
export class RoleUserGroup {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '角色用户组关联 ID',
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
    name: 'user_group_id',
    type: 'int',
    nullable: false,
    unsigned: true,
    comment: '用户组 ID',
  })
  userGroupId: number;
}
