import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum UserGroupState {
  Enable = 1, // 启用
  Disable = 0, // 禁用
}

@Entity('user_group')
export class UserGroup {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '用户组 ID',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: '用户组名称',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
    default: null,
    comment: '用户组描述',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: true,
    update: false,
    comment: '创建人',
  })
  create: string;

  @CreateDateColumn({
    name: 'create_time',
    type: 'datetime',
    nullable: false,
    update: false,
    comment: '创建时间',
  })
  createTime: string;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: true,
    comment: '更新人',
  })
  update: string;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'datetime',
    comment: '更新时间',
  })
  updateTime: string;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
    default: UserGroupState.Enable,
    comment: '状态',
  })
  state: UserGroupState;
}
