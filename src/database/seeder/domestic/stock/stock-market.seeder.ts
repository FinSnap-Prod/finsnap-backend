import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { StockInfo } from '../../../entities/stock/stock-info.entity';
import { StockMarketData } from '../../../entities/stock/stock-market-data.entity';
import { getKisAccessToken } from '../../token/kis-token';

@Injectable()
export class StockMarketSeeder {
  private readonly logger = new Logger(StockMarketSeeder.name);

  constructor(private dataSource: DataSource) {}

  async run() {
    const token = await getKisAccessToken();
    const stocks = await this.getStocks();
    this.logger.log(`조회된 ticker 수: ${stocks.length}`);

    const chunkSize = 10; // 한 번에 처리할 요청 수
    for (let i = 0; i < stocks.length; i += chunkSize) {
      const chunk = stocks.slice(i, i + chunkSize);
      const promises = chunk.map(({ ticker }) =>
        this.fetchAndSaveKoreaStockPrice(ticker, token),
      );
      await Promise.all(promises);
      this.logger.log(`Processed chunk ${i / chunkSize + 1}`);
      if (i + chunkSize < stocks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // API 속도 제한
      }
    }
  }

  private async getStocks() {
    const stockRepo = this.dataSource.getRepository(StockInfo);
    return stockRepo.find({
      where: [{ market: 'KOSPI' }, { market: 'KOSDAQ' }],
      select: ['ticker'],
    });
  }

  private async fetchAndSaveKoreaStockPrice(ticker: string, token: string) {
    try {
      const stockRepo = this.dataSource.getRepository(StockInfo);
      const stock = await stockRepo.findOne({ where: { ticker } });
      if (!stock) throw new Error(`No StockInfo for ticker: ${ticker}`);

      const output = await this.fetchPriceData(ticker, token);
      const output3 = await this.fetchProfitRatioData(ticker, token);

      const marketData = new StockMarketData();
      marketData.stock_info_id = stock.id;
      marketData.price = output.stck_prpr;
      marketData.change_price = output.prdy_vrss;
      marketData.change_rate = output.prdy_ctrt;
      marketData.market_cap = output.hts_avls;
      marketData.per = output.per;
      marketData.pbr = output.pbr;
      marketData.roa = output3?.cptl_ntin_rate ?? '0';
      marketData.roe = output3?.self_cptl_ntin_inrt ?? '0';
      marketData.eps = output.eps;
      marketData.bps = output.bps;

      await this.dataSource
        .getRepository(StockMarketData)
        .upsert(marketData, ['stock_info_id']);
      this.logger.log(`적재 성공: ${ticker}`);
    } catch (err) {
      this.logger.error(`Error for ticker ${ticker}:`, err);
    }
  }

  private async fetchPriceData(ticker: string, token: string) {
    const { data } = await axios.get(
      'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price',
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          authorization: `Bearer ${token}`,
          appkey: process.env.KIS_APP_KEY,
          appsecret: process.env.KIS_APP_SECRET,
          tr_id: 'FHKST01010100',
          custtype: 'P',
        },
        params: {
          fid_cond_mrkt_div_code: 'J',
          fid_input_iscd: ticker,
        },
      },
    );
    return data.output;
  }

  private async fetchProfitRatioData(ticker: string, token: string) {
    const { data } = await axios.get(
      'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/finance/profit-ratio',
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          authorization: `Bearer ${token}`,
          appkey: process.env.KIS_APP_KEY,
          appsecret: process.env.KIS_APP_SECRET,
          tr_id: 'FHKST66430400',
          custtype: 'P',
        },
        params: {
          fid_cond_mrkt_div_code: 'J',
          fid_input_iscd: ticker,
          fid_div_cls_code: '0',
        },
      },
    );
    return data.output[0];
  }
}
