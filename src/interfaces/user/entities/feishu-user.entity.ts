import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FeishuUser {
  @PrimaryColumn({
    name: 'user_id',
    type: 'varchar',
  })
  userId: string;

  @Column({
    name: 'avatar_big',
    type: 'varchar',
  })
  avatarBig: string;

  @Column({
    name: 'avatar_middle',
    type: 'varchar',
  })
  avatarMiddle: string;

  @Column({
    name: 'avatar_thumb',
    type: 'varchar',
  })
  avatarThumb: string;

  @Column({
    name: 'avatar_url',
    type: 'varchar',
  })
  avatarUrl: string;

  @Column({
    type: 'varchar',
  })
  email: string;

  @Column({
    name: 'en_name',
    type: 'varchar',
  })
  enName: string;

  @Column({
    type: 'varchar',
  })
  mobile: string;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    name: 'open_id',
    type: 'varchar',
  })
  openId: string;

  @Column({
    name: 'tenant_key',
    type: 'varchar',
  })
  tenantKey: string;

  @Column({
    name: 'union_id',
    type: 'varchar',
  })
  unionId: string;

  @OneToMany(() => User, (user) => user.feishu, {
    cascade: true,
  })
  users: User[];
}
