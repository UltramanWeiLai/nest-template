import { Test, TestingModule } from '@nestjs/testing';
import { RoleUserGroupService } from './role-user-group.service';

describe('RoleUserGroupService', () => {
  let service: RoleUserGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleUserGroupService],
    }).compile();

    service = module.get<RoleUserGroupService>(RoleUserGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
