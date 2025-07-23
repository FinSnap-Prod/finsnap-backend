import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { getKisAccessToken } from '../../token/kis-token';
import { EtfInfo } from '../../../entities/etf/etf-info.entity';
import { EtfPriceHistory } from '../../../entities/etf/etf-price-history.entity';

@Injectable()
export class OverseasEtfPriceHistorySeeder {
  private readonly logger = new Logger(OverseasEtfPriceHistorySeeder.name);
  private readonly marketCodeMap: Record<string, string> = {
    NASDAQ: 'NAS',
    AMEX: 'AMS',
    NYSE: 'NYS',
  };

  constructor(private dataSource: DataSource) {}

  async run() {
    const token = await getKisAccessToken();
    const etfs = await this.getEtfs();
    this.logger.log(`조회된 ticker 수: ${etfs.length}`);

    const chunkSize = 10;
    for (let i = 0; i < etfs.length; i += chunkSize) {
      const chunk = etfs.slice(i, i + chunkSize);
      const promises = chunk.map(({ ticker }) =>
        this.fetchAndSaveOverseasEtfPrice(ticker, token),
      );
      await Promise.all(promises);
      this.logger.log(`Processed chunk ${i / chunkSize + 1}`);
      if (i + chunkSize < etfs.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private async getEtfs() {
    return this.dataSource.getRepository(EtfInfo).find({
      where: [{ market: 'NASDAQ' }, { market: 'AMEX' }, { market: 'NYSE' }],
      select: ['ticker'],
    });
  }

  private async fetchAndSaveOverseasEtfPrice(ticker: string, token: string) {
    try {
      const etf = await this.dataSource
        .getRepository(EtfInfo)
        .findOne({ where: { ticker } });

      if (!etf) throw new Error(`No EtfInfo for ticker: ${ticker}`);

      const market_code = this.marketCodeMap[etf.market] ?? etf.market;

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
        const priceData = new EtfPriceHistory();
        priceData.etf_info_id = etf.id;
        priceData.date = d.xymd; // "YYYYMMDD" 그대로 저장해도 되고, 변환이 필요하면 아래 참고
        priceData.open = d.open;
        priceData.high = d.high;
        priceData.low = d.low;
        priceData.close = d.clos;
        priceData.volume = d.tvol;
        return priceData;
      });

      await this.dataSource
        .getRepository(EtfPriceHistory)
        .upsert(priceHistories, ['etf_info_id', 'date']);
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
