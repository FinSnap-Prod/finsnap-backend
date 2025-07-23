import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { getKisAccessToken } from '../../token/kis-token';
import { EtfInfo } from '../../../entities/etf/etf-info.entity';
import { EtfMarketData } from '../../../entities/etf/etf-market-data.entity';

@Injectable()
export class OverseasEtfMarketSeeder {
  private readonly logger = new Logger(OverseasEtfMarketSeeder.name);
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

    const chunkSize = 10; // 한 번에 처리할 요청 수
    for (let i = 0; i < etfs.length; i += chunkSize) {
      const chunk = etfs.slice(i, i + chunkSize);
      const promises = chunk.map(({ ticker }) =>
        this.fetchAndSaveOverseasEtfPrice(ticker, token),
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
      where: [{ market: 'NASDAQ' }, { market: 'AMEX' }, { market: 'NYSE' }],
      select: ['ticker'],
    });
  }

  private async fetchAndSaveOverseasEtfPrice(ticker: string, token: string) {
    try {
      const etfRepo = this.dataSource.getRepository(EtfInfo);
      const etf = await etfRepo.findOne({ where: { ticker } });
      if (!etf) throw new Error(`No EtfInfo for ticker: ${ticker}`);

      const market_code = this.marketCodeMap[etf.market] ?? etf.market;

      const output = await this.fetchPriceData(market_code, ticker, token);

      const marketData = new EtfMarketData();
      marketData.etf_info_id = etf.id;
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

      await this.dataSource
        .getRepository(EtfMarketData)
        .upsert(marketData, ['etf_info_id']);
      this.logger.log(`적재 성공: ${ticker} ${market_code}`);
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
