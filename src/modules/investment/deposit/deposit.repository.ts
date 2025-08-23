import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepositInfo } from 'src/database/entities/deposit/deposit-info.entity';
import { DepositType } from 'src/database/entities/deposit/deposit-type.entity';
import { DepositMarketData } from 'src/database/entities/deposit/deposit-market-data.entity';

@Injectable()
export class DepositRepository {
  constructor(
    @InjectRepository(DepositInfo)
    private depositInfoRepository: Repository<DepositInfo>,
    @InjectRepository(DepositMarketData)
    private depositMarketDataRepository: Repository<DepositMarketData>,
    @InjectRepository(DepositType)
    private depositTypeRepository: Repository<DepositType>,
  ) {}
}
