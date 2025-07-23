import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { StockPriceHistory } from '../../../entities/stock/stock-price-history.entity';
import { DataSource } from 'typeorm';
import { getKisAccessToken } from '../../token/kis-token';
import { StockInfo } from '../../../entities/stock/stock-info.entity';

@Injectable()
export class OverseasStockPriceHistorySeeder {
  private readonly logger = new Logger(OverseasStockPriceHistorySeeder.name);
  private readonly marketCodeMap: Record<string, string> = {
    NASDAQ: 'NAS',
    AMEX: 'AMS',
    NYSE: 'NYS',
  };

  constructor(private dataSource: DataSource) {}

  async run() {
    const token = await getKisAccessToken();
    const stocks = await this.getStocks();
    this.logger.log(`조회된 ticker 수: ${stocks.length}`);

    const chunkSize = 10;
    for (let i = 0; i < stocks.length; i += chunkSize) {
      const chunk = stocks.slice(i, i + chunkSize);
      const promises = chunk.map(({ ticker }) =>
        this.fetchAndSaveOverseasStockPrice(ticker, token),
      );
      await Promise.all(promises);
      this.logger.log(`Processed chunk ${i / chunkSize + 1}`);
      if (i + chunkSize < stocks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private async getStocks() {
    return this.dataSource.getRepository(StockInfo).find({
      where: [{ market: 'NASDAQ' }, { market: 'AMEX' }, { market: 'NYSE' }],
      select: ['ticker'],
    });
  }

  private async fetchAndSaveOverseasStockPrice(ticker: string, token: string) {
    try {
      const stock = await this.dataSource
        .getRepository(StockInfo)
        .findOne({ where: { ticker } });

      if (!stock) throw new Error(`No StockInfo for ticker: ${ticker}`);

      const market_code = this.marketCodeMap[stock.market] ?? stock.market;

      const outputs = await this.fetchPriceHistoryData(
        market_code,
        ticker,
        token,
      );

      if (!outputs || !Array.isArray(outputs) || outputs.length === 0) {
        this.logger.error(`No price history data for ticker ${ticker}`);
        return;
      }
      const priceHistories = outputs.map((d) => {
        const priceData = new StockPriceHistory();
        priceData.stock_info_id = stock.id;
        priceData.date = d.xymd; // "YYYYMMDD" 그대로 저장해도 되고, 변환이 필요하면 아래 참고
        priceData.open = d.open;
        priceData.high = d.high;
        priceData.low = d.low;
        priceData.close = d.clos;
        priceData.volume = d.tvol;
        return priceData;
      });

      await this.dataSource
        .getRepository(StockPriceHistory)
        .upsert(priceHistories, ['stock_info_id', 'date']);
      this.logger.log(`적재 성공: ${ticker}, ${market_code}`);
    } catch (err) {
      this.logger.error(`Error for ticker ${ticker}:`, err);
    }
  }

  private async fetchPriceHistoryData(
    market_code: string,
    ticker: string,
    token: string,
  ) {
    const { data } = await axios.get(
      'https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/dailyprice',
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          authorization: `Bearer ${token}`,
          appkey: process.env.KIS_APP_KEY,
          appsecret: process.env.KIS_APP_SECRET,
          tr_id: 'HHDFS76240000',
        },
        params: {
          AUTH: '',
          EXCD: market_code,
          SYMB: ticker,
          GUBN: '0',
          BYMD: '',
          MODP: '1',
        },
      },
    );
    return data.output2;
  }
}
