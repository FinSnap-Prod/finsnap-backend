import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockInfo } from 'src/database/entities/stock/stock-info.entity';
import { StockMarketData } from 'src/database/entities/stock/stock-market-data.entity';
import { StockPriceHistory } from 'src/database/entities/stock/stock-price-history.entity';

@Injectable()
export class StockRepository {
  constructor(
    @InjectRepository(StockInfo)
    private stockInfoRepository: Repository<StockInfo>,
    @InjectRepository(StockMarketData)
    private stockMarketDataRepository: Repository<StockMarketData>,
    @InjectRepository(StockPriceHistory)
    private stockPriceHistoryRepository: Repository<StockPriceHistory>,
  ) {}

  async findStockInfo(stock_id: number) {
    const stockInfo = await this.stockInfoRepository.findOne({
      where: { id: stock_id },
      relations: ['stock_market_data', 'currency_code'],
    });

    if (!stockInfo) {
      return null;
    }

    return {
      ticker: stockInfo.ticker,
      kor_name: stockInfo.kor_name,
      eng_name: stockInfo.eng_name,
      market: stockInfo.market,
      price: stockInfo.stock_market_data.price,
      change_price: stockInfo.stock_market_data.change_price,
      change_rate: stockInfo.stock_market_data.change_rate,
    };
  }
}
