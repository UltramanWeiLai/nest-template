// src/entities/User.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FeishuUser } from './feishu-user.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: 'ID',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
    comment: '用户名',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: '密码',
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '昵称',
  })
  name: string;

  @CreateDateColumn({
    name: 'create_time',
    type: 'datetime',
    nullable: false,
    update: false,
    comment: '创建时间',
  })
  createTime: string;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'datetime',
    nullable: true,
    comment: '更新时间',
  })
  updateTime: string;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
    default: 1,
  })
  status: number;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => FeishuUser)
  feishu: FeishuUser;
}
