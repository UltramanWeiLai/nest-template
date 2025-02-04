import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum RoleState {
  Enable = 1, // 启用
  Disable = 0, // 禁用
}

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '角色 ID',
  })
  id: number;

  @Column({
    name: 'project_id',
    type: 'int',
    nullable: true,
    unsigned: true,
    default: null,
    comment: '所属项目 ID',
  })
  parentId?: number;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: '角色名称',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: '角色描述',
  })
  description: string;

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
    default: RoleState.Enable,
    comment: '状态',
  })
  state: RoleState;
}
