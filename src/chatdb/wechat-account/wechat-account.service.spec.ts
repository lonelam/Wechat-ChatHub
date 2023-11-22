import { Test, TestingModule } from '@nestjs/testing';
import { WechatAccountService } from './wechat-account.service';

describe('WechatAccountService', () => {
  let service: WechatAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WechatAccountService],
    }).compile();

    service = module.get<WechatAccountService>(WechatAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
