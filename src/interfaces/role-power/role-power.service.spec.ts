import { Test, TestingModule } from '@nestjs/testing';
import { RolePowerService } from './role-power.service';

describe('RolePowerService', () => {
  let service: RolePowerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolePowerService],
    }).compile();

    service = module.get<RolePowerService>(RolePowerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
