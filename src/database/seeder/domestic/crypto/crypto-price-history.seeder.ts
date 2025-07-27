import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoInfo } from '../../../entities/crypto/crypto-info.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { CryptoPriceHistory } from '../../../entities/crypto/crypto-price-history.entity';

@Injectable()
export class CryptoPriceHistorySeeder {
  private readonly logger = new Logger(CryptoPriceHistorySeeder.name);
  private readonly API_URL = 'https://api.bithumb.com/v1/candles/days';

  constructor(
    @InjectRepository(CryptoInfo)
    private readonly cryptoInfoRepo: Repository<CryptoInfo>,
    @InjectRepository(CryptoPriceHistory)
    private readonly cryptoPriceHistoryRepo: Repository<CryptoPriceHistory>,
  ) {}

  async run() {
    this.logger.log('🏦 Starting Crypto Price History Seeder...');

    const cryptoInfos = await this.getCryptoInfos();
    this.logger.log(`📊 Found ${cryptoInfos.length} crypto items to process`);

    const chunkSize = 100;
    for (let i = 0; i < cryptoInfos.length; i += chunkSize) {
      const chunk = cryptoInfos.slice(i, i + chunkSize);
      const promises = chunk.map(({ ticker }) =>
        this.fetchAndSaveCryptoPriceHistory(ticker),
      );
      await Promise.all(promises);
      this.logger.log(
        `✅ Processed chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(cryptoInfos.length / chunkSize)}`,
      );

      if (i + chunkSize < cryptoInfos.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private async getCryptoInfos() {
    const cryptoInfos = await this.cryptoInfoRepo.find({
      where: { crypto_market_id: 1 },
    });
    return cryptoInfos;
  }

  private async fetchAndSaveCryptoPriceHistory(ticker: string) {
    try {
      const cryptoInfo = await this.cryptoInfoRepo.findOne({
        where: { ticker },
      });
      if (!cryptoInfo) throw new Error(`No CryptoInfo for ticker: ${ticker}`);

      const response = await this.fetchPriceData(ticker);
      const priceData = response.data;

      for (const data of priceData) {
        // candle_date_time_kst에서 날짜 부분만 추출 (YYYY-MM-DD)
        const dateString = data.candle_date_time_kst.split('T')[0];

        const priceHistory = new CryptoPriceHistory();
        priceHistory.crypto_info_id = cryptoInfo.id;
        priceHistory.date = dateString;
        priceHistory.open = data.opening_price.toString();
        priceHistory.high = data.high_price.toString();
        priceHistory.low = data.low_price.toString();
        priceHistory.close = data.trade_price.toString();
        priceHistory.volume = data.candle_acc_trade_volume.toString();

        // upsert 사용 (unique constraint 기반)
        await this.cryptoPriceHistoryRepo.upsert(priceHistory, [
          'crypto_info_id',
          'date',
        ]);
      }

      this.logger.log(`✅ Successfully processed price history for ${ticker}`);
    } catch (err) {
      this.logger.error(`❌ Error processing ${ticker}:`, err.message);
    }
  }

  private async fetchPriceData(ticker: string) {
    const response = await axios.get(this.API_URL, {
      params: {
        market: ticker,
        count: 2,
      },
    });
    return response;
  }
}
