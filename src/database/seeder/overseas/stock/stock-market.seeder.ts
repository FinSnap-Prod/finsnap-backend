import { Injectable, Logger } from '@nestjs/common';
import { getKisAccessToken } from '../../token/kis-token';
import { DataSource } from 'typeorm';
import { StockInfo } from '../../../entities/stock/stock-info.entity';
import { StockMarketData } from '../../../entities/stock/stock-market-data.entity';
import axios from 'axios';

@Injectable()
export class OverseasStockMarketSeeder {
  private readonly logger = new Logger(OverseasStockMarketSeeder.name);
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
    const stockRepo = this.dataSource.getRepository(StockInfo);
    return stockRepo.find({
      where: [{ market: 'NASDAQ' }, { market: 'AMEX' }, { market: 'NYSE' }],
      select: ['ticker'],
    });
  }

  private async fetchAndSaveOverseasStockPrice(ticker: string, token: string) {
    try {
      const stockRepo = this.dataSource.getRepository(StockInfo);
      const stock = await stockRepo.findOne({ where: { ticker } });
      if (!stock) throw new Error(`No StockInfo for ticker: ${ticker}`);

      const market_code = this.marketCodeMap[stock.market] ?? stock.market;

      const output = await this.fetchPriceData(market_code, ticker, token);

      const marketData = new StockMarketData();
      marketData.stock_info_id = stock.id;
      marketData.price = output.last;
      // p_xsng가 '2'면 양수, '5'면 음수로 설정하고 환율로 나누기
      const pXdif = parseFloat(output.p_xdif);
      const tRate = parseFloat(output.t_rate);
      const changeValue =
        output.p_xsng === '2'
          ? Math.abs(pXdif / tRate)
          : output.p_xsng === '5'
            ? -Math.abs(pXdif / tRate)
            : pXdif / tRate;
      marketData.change_price = changeValue.toString();
      marketData.change_rate = output.p_xrat;
      marketData.market_cap = output.tomv;
      marketData.per = output.perx;
      marketData.pbr = output.pbrx;
      // roa, roe는 현재 API에서 제공하지 않으므로 설정하지 않음 (기본값 사용)
      marketData.eps = output.epsx;
      marketData.bps = output.bpsx;

      await this.dataSource
        .getRepository(StockMarketData)
        .upsert(marketData, ['stock_info_id']);
      this.logger.log(`적재 성공: ${ticker}, ${market_code}`);
    } catch (err) {
      this.logger.error(`Error for ticker ${ticker}:`, err);
    }
  }

  private async fetchPriceData(
    market_code: string,
    ticker: string,
    token: string,
  ) {
    const { data } = await axios.get(
      'https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/price-detail',
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          authorization: `Bearer ${token}`,
          appkey: process.env.KIS_APP_KEY,
          appsecret: process.env.KIS_APP_SECRET,
          tr_id: 'HHDFS76200200',
        },
        params: {
          AUTH: '',
          EXCD: market_code,
          SYMB: ticker,
        },
      },
    );
    return data.output;
  }
}
