import { Test, TestingModule } from '@nestjs/testing';
import { PadLocalTokenService } from './pad-local-token.service';

describe('PadLocalTokenService', () => {
  let service: PadLocalTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PadLocalTokenService],
    }).compile();

    service = module.get<PadLocalTokenService>(PadLocalTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
