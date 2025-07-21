import { Test, TestingModule } from '@nestjs/testing';
import { EtfService } from './etf.service';

describe('EtfService', () => {
  let service: EtfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EtfService],
    }).compile();

    service = module.get<EtfService>(EtfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
