import { Test, TestingModule } from '@nestjs/testing';
import { UserUserGroupService } from './user-user-group.service';

describe('UserUserGroupService', () => {
  let service: UserUserGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserUserGroupService],
    }).compile();

    service = module.get<UserUserGroupService>(UserUserGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
