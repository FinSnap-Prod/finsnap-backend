import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CryptoInfo } from '../../../entities/crypto/crypto-info.entity';
import { CryptoMarketData } from '../../../entities/crypto/crypto-market-data.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CryptoMarketSeeder {
  private readonly logger = new Logger(CryptoMarketSeeder.name);
  private readonly API_URL = 'https://api.bithumb.com/v1/ticker';

  constructor(
    @InjectRepository(CryptoInfo)
    private readonly cryptoInfoRepo: Repository<CryptoInfo>,
    @InjectRepository(CryptoMarketData)
    private readonly cryptoMarketDataRepo: Repository<CryptoMarketData>,
  ) {}

  async run() {
    this.logger.log('🏦 Starting Crypto Market Seeder...');

    const cryptoInfos = await this.getCryptoInfos();
    this.logger.log(`📊 Found ${cryptoInfos.length} crypto items to process`);

    const chunkSize = 100;
    for (let i = 0; i < cryptoInfos.length; i += chunkSize) {
      const chunk = cryptoInfos.slice(i, i + chunkSize);
      const promises = chunk.map(({ ticker }) =>
        this.fetchAndSaveCryptoPrice(ticker),
      );
      await Promise.all(promises);
      this.logger.log(
        `✅ Processed chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(cryptoInfos.length / chunkSize)}`,
      );

      if (i + chunkSize < cryptoInfos.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    this.logger.log('✅ Crypto Market Seeder completed successfully!');
  }

  private async getCryptoInfos() {
    const cryptoInfos = await this.cryptoInfoRepo.find({
      where: { crypto_market_id: 1 },
    });
    return cryptoInfos;
  }

  private async fetchAndSaveCryptoPrice(ticker: string) {
    try {
      const cryptoInfo = await this.cryptoInfoRepo.findOne({
        where: { ticker },
      });
      if (!cryptoInfo) throw new Error(`No CryptoInfo for ticker: ${ticker}`);

      const response = await this.fetchPriceData(ticker);

      // ✅ 디버깅: 처음 몇 개 항목에 대해서만 응답 구조 로그
      if (ticker === 'KRW-BTC' || ticker === 'KRW-ETH') {
        this.logger.log(`🔍 API Response for ${ticker}:`, {
          status: response.status,
          isArray: Array.isArray(response.data),
          dataLength: Array.isArray(response.data)
            ? response.data.length
            : 'N/A',
          firstItem:
            Array.isArray(response.data) && response.data[0]
              ? `market: ${response.data[0].market}, price: ${response.data[0].trade_price}`
              : 'N/A',
        });
      }

      // ✅ 수정: API 응답이 직접 배열 형태
      if (!Array.isArray(response.data) || response.data.length === 0) {
        this.logger.warn(`⚠️ No valid response data for ${ticker}`);
        return;
      }

      // 배열에서 해당 ticker 데이터 찾기
      const data = response.data.find((item) => item.market === ticker);
      if (!data) {
        this.logger.warn(`⚠️ No data found for ${ticker} in response`);
        return;
      }

      // NaN 값 체크 및 기본값 설정
      const price = isNaN(data.trade_price) ? '0' : data.trade_price.toString();
      const changePrice = isNaN(data.change_price)
        ? '0'
        : data.change_price.toString();
      const changeRate = isNaN(data.change_rate)
        ? '0'
        : (100 * data.change_rate).toString();
      const accTradeVolume = isNaN(data.acc_trade_volume)
        ? '0'
        : data.acc_trade_volume.toString();
      const accTradePrice = isNaN(data.acc_trade_price)
        ? '0'
        : data.acc_trade_price.toString();

      const marketData = new CryptoMarketData();
      marketData.crypto_info_id = cryptoInfo.id;
      marketData.price = price;
      marketData.change_price = changePrice;
      marketData.change_rate = changeRate;
      marketData.acc_trade_volume = accTradeVolume;
      marketData.acc_trade_price = accTradePrice;
      marketData.market_cap = '0';

      await this.cryptoMarketDataRepo.upsert(marketData, ['crypto_info_id']);

      this.logger.log(`✅ Saved market data for: ${ticker}`);
    } catch (err) {
      this.logger.error(`❌ Error processing ${ticker}:`, err.message);
    }
  }

  private async fetchPriceData(ticker: string) {
    const response = await axios.get(this.API_URL, {
      params: {
        markets: ticker,
      },
    });
    return response;
  }
}
