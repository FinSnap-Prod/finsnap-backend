import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { getKisAccessToken } from '../token/kis-token';
import { EtfInfo } from '../../entities/etf/etf-info.entity';
import { EtfMarketData } from '../../entities/etf/etf-market-data.entity';

@Injectable()
export class EtfMarketSeeder {
  private readonly logger = new Logger(EtfMarketSeeder.name);

  constructor(private dataSource: DataSource) {}

  async run() {
    const token = await getKisAccessToken();
    const etfs = await this.getEtfs();
    this.logger.log(`조회된 ticker 수: ${etfs.length}`);

    const chunkSize = 10; // 한 번에 처리할 요청 수
    for (let i = 0; i < etfs.length; i += chunkSize) {
      const chunk = etfs.slice(i, i + chunkSize);
      const promises = chunk.map(({ ticker }) =>
        this.fetchAndSaveKoreaEtfPrice(ticker, token),
      );
      await Promise.all(promises);
      this.logger.log(`Processed chunk ${i / chunkSize + 1}`);
      if (i + chunkSize < etfs.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // API 속도 제한
      }
    }
  }

  private async getEtfs() {
    const etfRepo = this.dataSource.getRepository(EtfInfo);
    return etfRepo.find({
      where: [{ market: 'KOSPI' }],
      select: ['ticker'],
    });
  }

  private async fetchAndSaveKoreaEtfPrice(ticker: string, token: string) {
    try {
      const etfRepo = this.dataSource.getRepository(EtfInfo);
      const etf = await etfRepo.findOne({ where: { ticker } });
      if (!etf) throw new Error(`No EtfInfo for ticker: ${ticker}`);

      const output = await this.fetchPriceData(ticker, token);

      const marketData = new EtfMarketData();
      marketData.etf_info_id = etf.id;
      marketData.price = output.stck_prpr;
      marketData.change_price = output.prdy_vrss;
      marketData.change_rate = output.prdy_ctrt;
      marketData.market_cap = output.hts_avls;

      await this.dataSource
        .getRepository(EtfMarketData)
        .upsert(marketData, ['etf_info_id']);
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
}
