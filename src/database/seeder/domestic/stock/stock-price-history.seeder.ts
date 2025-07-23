import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import axios from 'axios';
import { StockInfo } from '../../../entities/stock/stock-info.entity';
import { StockPriceHistory } from '../../../entities/stock/stock-price-history.entity';
import { getKisAccessToken } from '../../token/kis-token';

@Injectable()
export class StockPriceHistorySeeder {
  private readonly logger = new Logger(StockPriceHistorySeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async run() {
    const token = await getKisAccessToken();
    const stocks = await this.getStocks();
    this.logger.log(`조회된 ticker 수: ${stocks.length}`);

    const chunkSize = 10;
    for (let i = 0; i < stocks.length; i += chunkSize) {
      const chunk = stocks.slice(i, i + chunkSize);
      const promises = chunk.map(({ ticker }) =>
        this.fetchAndSaveKoreaStockPriceHistory(ticker, token),
      );
      await Promise.all(promises);
      this.logger.log(
        `Processed chunk ${i / chunkSize + 1} of ${Math.ceil(stocks.length / chunkSize)}`,
      );
      if (i + chunkSize < stocks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private async getStocks() {
    return this.dataSource.getRepository(StockInfo).find({
      where: [{ market: 'KOSPI' }, { market: 'KOSDAQ' }],
      select: ['ticker'],
    });
  }

  private async fetchAndSaveKoreaStockPriceHistory(
    ticker: string,
    token: string,
  ) {
    try {
      const stock = await this.dataSource
        .getRepository(StockInfo)
        .findOne({ where: { ticker } });
      if (!stock) {
        this.logger.warn(`No StockInfo for ticker: ${ticker}`);
        return;
      }

      const priceData = await this.fetchPriceHistoryDataWithRetry(
        ticker,
        token,
      );
      if (!priceData || priceData.length === 0) {
        this.logger.log(`No price history for ticker: ${ticker}`);
        return;
      }

      const priceHistories = priceData.map((d) => {
        const history = new StockPriceHistory();
        history.stock_info_id = stock.id;
        history.date = d.stck_bsop_date;
        history.open = d.stck_oprc;
        history.high = d.stck_hgpr;
        history.low = d.stck_lwpr;
        history.close = d.stck_clpr;
        history.volume = d.acml_vol;
        return history;
      });

      await this.dataSource
        .getRepository(StockPriceHistory)
        .upsert(priceHistories, ['stock_info_id', 'date']);

      this.logger.log(`성공: ${ticker} - ${priceHistories.length}개 항목`);
    } catch (err) {
      this.logger.error(`실패: ${ticker}`, err.stack);
    }
  }

  private async fetchPriceHistoryDataWithRetry(
    ticker: string,
    token: string,
    retries = 3,
    delay = 1000,
  ) {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.fetchPriceHistoryData(ticker, token);
      } catch (error) {
        if (i === retries - 1) throw error;
        this.logger.warn(`재시도 ${i + 1}: ${ticker}, 오류: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  private async fetchPriceHistoryData(ticker: string, token: string) {
    const { data } = await axios.get(
      'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-price',
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          authorization: `Bearer ${token}`,
          appkey: process.env.KIS_APP_KEY,
          appsecret: process.env.KIS_APP_SECRET,
          tr_id: 'FHKST01010400',
          custtype: 'P',
        },
        params: {
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_INPUT_ISCD: ticker,
          FID_PERIOD_DIV_CODE: 'D',
          FID_ORG_ADJ_PRC: '1',
        },
      },
    );
    return data.output;
  }
}
