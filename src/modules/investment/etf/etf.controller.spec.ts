import { Test, TestingModule } from '@nestjs/testing';
import { EtfController } from './etf.controller';
import { EtfService } from './etf.service';

describe('EtfController', () => {
  let controller: EtfController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EtfController],
      providers: [EtfService],
    }).compile();

    controller = module.get<EtfController>(EtfController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
