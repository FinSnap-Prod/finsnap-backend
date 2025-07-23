import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import axios from 'axios';
import { EtfInfo } from '../../../entities/etf/etf-info.entity';
import { EtfComponent } from '../../../entities/etf/etf-component.entity';
import { getKisAccessToken } from '../../token/kis-token';
import { StockInfo } from '../../../entities/stock/stock-info.entity';

@Injectable()
export class EtfComponentSeeder {
  private readonly logger = new Logger(EtfComponentSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Seeder 실행을 위한 메인 메서드
   */
  async run() {
    const token = await getKisAccessToken();
    const etfs = await this.getEtfs();
    this.logger.log(`조회된 ETF 수: ${etfs.length}`);

    // API 과부하를 막기 위해 10개씩 병렬 처리
    const chunkSize = 10;
    for (let i = 0; i < etfs.length; i += chunkSize) {
      const chunk = etfs.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(({ ticker }) =>
          this.fetchAndSaveKoreaEtfComponent(ticker, token),
        ),
      );
      this.logger.log(
        `Processed chunk ${i / chunkSize + 1} of ${Math.ceil(etfs.length / chunkSize)}`,
      );
      // API 요청 속도 제한을 위해 chunk 처리 후 1초 대기
      if (i + chunkSize < etfs.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * 데이터베이스에서 KOSPI의 모든 ETF 목록을 조회
   */
  private async getEtfs() {
    return this.dataSource.getRepository(EtfInfo).find({
      where: [{ market: 'KOSPI' }],
      select: ['ticker', 'id'],
    });
  }

  /**
   * 특정 ETF의 모든 구성종목 정보를 가져와 DB에 저장 (upsert)
   * @param ticker ETF 종목 코드
   * @param token KIS API 인증 토큰
   */
  private async fetchAndSaveKoreaEtfComponent(ticker: string, token: string) {
    try {
      // 1. ticker로 ETF 정보 조회
      const etf = await this.dataSource
        .getRepository(EtfInfo)
        .findOne({ where: { ticker } });
      if (!etf) {
        this.logger.warn(`EtfInfo를 찾을 수 없음: ${ticker}`);
        return;
      }

      // 2. API를 통해 ETF 구성종목 데이터 가져오기 (재시도 로직 포함)
      const componentsData = await this.fetchEtfComponentWithRetry(
        ticker,
        token,
      );
      if (!componentsData || componentsData.length === 0) {
        this.logger.log(`구성종목 없음: ${ticker}`);
        return;
      }

      // 3. 구성종목들의 ticker로 StockInfo ID를 한번에 조회하여 Map으로 변환 (성능 최적화)
      const stockInfos = await this.getStockInfos(
        componentsData.map((c) => c.stck_shrn_iscd),
      );
      const stockInfoMap = new Map(stockInfos.map((s) => [s.ticker, s.id]));

      // 4. 각 구성종목을 EtfComponent 엔티티 객체로 변환
      const etfComponents = componentsData
        .map((component) => {
          const stockInfoId = stockInfoMap.get(component.stck_shrn_iscd);
          if (!stockInfoId) return null; // DB에 없는 주식은 제외

          const etfComponent = new EtfComponent();
          etfComponent.etf_info_id = etf.id;
          etfComponent.stock_info_id = stockInfoId;
          etfComponent.weight_percent = component.etf_cnfg_issu_rlim;
          return etfComponent;
        })
        .filter(Boolean); // null 값 제거

      // 5. 변환된 엔티티 객체들을 DB에 한번에 upsert
      if (etfComponents.length > 0) {
        await this.dataSource
          .getRepository(EtfComponent)
          .upsert(etfComponents, ['etf_info_id', 'stock_info_id']);
        this.logger.log(`성공: ${ticker} - ${etfComponents.length}개 구성종목`);
      }
    } catch (err) {
      this.logger.error(`실패: ${ticker}`, err.stack);
    }
  }

  /**
   * 주어진 ticker 배열에 해당하는 주식 정보를 DB에서 조회
   * @param tickers 주식 종목 코드 배열
   */
  private async getStockInfos(tickers: string[]) {
    const stockRepo = this.dataSource.getRepository(StockInfo);
    return stockRepo
      .createQueryBuilder('stock')
      .where('stock.ticker IN (:...tickers)', { tickers })
      .select(['stock.id', 'stock.ticker'])
      .getMany();
  }

  /**
   * API 요청 실패 시 재시도를 포함하여 ETF 구성종목 데이터를 가져옴
   */
  private async fetchEtfComponentWithRetry(
    ticker: string,
    token: string,
    retries = 3,
    delay = 1000,
  ) {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.fetchEtfComponent(ticker, token);
      } catch (error) {
        if (i === retries - 1) throw error;
        this.logger.warn(`재시도 ${i + 1}: ${ticker}, 오류: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  /**
   * KIS API를 호출하여 ETF 구성종목 정보를 가져옴
   */
  private async fetchEtfComponent(ticker: string, token: string) {
    const { data } = await axios.get(
      'https://openapi.koreainvestment.com:9443/uapi/etfetn/v1/quotations/inquire-component-stock-price',
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          authorization: `Bearer ${token}`,
          appkey: process.env.KIS_APP_KEY,
          appsecret: process.env.KIS_APP_SECRET,
          tr_id: 'FHKST121600C0',
          custtype: 'P',
        },
        params: {
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_INPUT_ISCD: ticker,
          FID_COND_SCR_DIV_CODE: '11216',
        },
      },
    );
    return data.output2;
  }
}
