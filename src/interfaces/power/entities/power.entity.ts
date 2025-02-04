import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum PowerState {
  Enable = 1, // 启用
  Disable = 0, // 禁用
}

export enum PowerAction {
  Manage = 'manage',
  Create = 'create',
  View = 'view',
  Update = 'update',
  Delete = 'delete',
}

@Entity()
export class Power {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '权限 ID',
  })
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    comment: '资源 key',
  })
  resourceKey: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: '权限名称',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: '权限行为',
  })
  action: PowerAction;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
    default: null,
    comment: '权限描述',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
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
    default: PowerState.Enable,
    comment: '状态',
  })
  state: PowerState;
}
