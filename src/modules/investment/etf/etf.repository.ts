import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EtfInfo } from 'src/database/entities/etf/etf-info.entity';
import { EtfMarketData } from 'src/database/entities/etf/etf-market-data.entity';
import { EtfPriceHistory } from 'src/database/entities/etf/etf-price-history.entity';
import { EtfComponent } from 'src/database/entities/etf/etf-component.entity';

@Injectable()
export class EtfRepository {
  constructor(
    @InjectRepository(EtfInfo)
    private etfInfoRepository: Repository<EtfInfo>,
    @InjectRepository(EtfMarketData)
    private etfMarketDataRepository: Repository<EtfMarketData>,
    @InjectRepository(EtfPriceHistory)
    private etfPriceHistoryRepository: Repository<EtfPriceHistory>,
    @InjectRepository(EtfComponent)
    private etfComponentRepository: Repository<EtfComponent>,
  ) {}

  async findEtfInfo(etf_id: number) {
    const etfInfo = await this.etfInfoRepository.findOne({
      where: { id: etf_id },
      relations: ['etf_market_data', 'currency_code'],
    });

    if (!etfInfo) {
      return null;
    }

    return {
      ticker: etfInfo.ticker,
      kor_name: etfInfo.kor_name,
      eng_name: etfInfo.eng_name,
      market: etfInfo.market,
      price: etfInfo.etf_market_data.price,
      change_price: etfInfo.etf_market_data.change_price,
      change_rate: etfInfo.etf_market_data.change_rate,
    };
  }
}
