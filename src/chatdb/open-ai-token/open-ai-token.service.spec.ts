import { Test, TestingModule } from '@nestjs/testing';
import { OpenAITokenService } from './open-ai-token.service';

describe('OpenAitokenService', () => {
  let service: OpenAITokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAITokenService],
    }).compile();

    service = module.get<OpenAITokenService>(OpenAITokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
