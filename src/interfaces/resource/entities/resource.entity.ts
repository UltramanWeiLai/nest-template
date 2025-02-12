import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Entity } from 'typeorm';

export enum ResourceState {
  Enable = 1, // 启用
  Disable = 0, // 禁用
}

@Entity()
export class Resource {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '资源 ID',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: '资源名称',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: '资源 key',
  })
  key: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
    default: null,
    comment: '资源描述',
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
    default: ResourceState.Enable,
    comment: '状态',
  })
  state: ResourceState;
}
