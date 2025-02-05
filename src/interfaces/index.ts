import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { UserGroupModule } from './user-group/user-group.module';
import { PowerModule } from './power/power.module';
import { ResourceModule } from './resource/resource.module';
import { RolePowerModule } from './role-power/role-power.module';
import { RoleUserGroupModule } from './role-user-group/role-user-group.module';
import { RoleUserModule } from './role-user/role-user.module';
import { UserUserGroupModule } from './user-user-group/user-user-group.module';
import { PowerResourceModule } from './power-resource/power-resource.module';

export const InterfaceModules = [
  UserModule,
  RoleModule,
  UserGroupModule,
  PowerModule,
  ResourceModule,
  RolePowerModule,
  RoleUserGroupModule,
  RoleUserModule,
  UserUserGroupModule,
  PowerResourceModule,
];
