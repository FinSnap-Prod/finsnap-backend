import { DataSource } from 'typeorm';
import { getKisAccessToken } from '../token/kis-token';
import { EtfInfo } from '../../entities/etf/etf-info.entity';
import axios from 'axios';
import { EtfPriceHistory } from '../../entities/etf/etf-price-history.entity';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EtfPriceHistorySeeder {
  private readonly logger = new Logger(EtfPriceHistorySeeder.name);

  constructor(private dataSource: DataSource) {}

  async run() {
    const token = await getKisAccessToken();
    const etfs = await this.getEtfs();
    this.logger.log(`조회된 ticker 수: ${etfs.length}`);

    const chunkSize = 10;
    for (let i = 0; i < etfs.length; i += chunkSize) {
      const chunk = etfs.slice(i, i + chunkSize);
      const promises = chunk.map(({ ticker }) =>
        this.fetchAndSaveKoreaEtfPriceHistory(ticker, token),
      );
      await Promise.all(promises);
      this.logger.log(`Processed chunk ${i / chunkSize + 1}`);
      if (i + chunkSize < etfs.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // API 속도 제한
      }
    }
  }

  private async getEtfs() {
    return this.dataSource.getRepository(EtfInfo).find({
      where: [{ market: 'KOSPI' }],
      select: ['ticker'],
    });
  }

  private async fetchAndSaveKoreaEtfPriceHistory(
    ticker: string,
    token: string,
  ) {
    try {
      const etfRepo = this.dataSource.getRepository(EtfInfo);
      const etf = await etfRepo.findOne({ where: { ticker } });
      if (!etf) throw new Error(`No EtfInfo for ticker: ${ticker}`);

      const output = await this.fetchPriceHistoryData(ticker, token);

      const priceHistory = new EtfPriceHistory();
      priceHistory.etf_info_id = etf.id;
      priceHistory.date = output.stck_bsop_date;
      priceHistory.open = output.stck_oprc;
      priceHistory.high = output.stck_hgpr;
      priceHistory.low = output.stck_lwpr;
      priceHistory.close = output.stck_clpr;
      priceHistory.volume = output.acml_vol;

      await this.dataSource
        .getRepository(EtfPriceHistory)
        .upsert(priceHistory, ['etf_info_id', 'date']);
      console.log(`적재 성공: ${ticker}`);
    } catch (err) {
      this.logger.error(`Error for ticker ${ticker}:`, err);
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
    return data.output[0];
  }
}
