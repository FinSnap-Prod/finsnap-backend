import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CryptoInfo } from '../../../entities/crypto/crypto-info.entity';
import { CryptoPriceHistory } from '../../../entities/crypto/crypto-price-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OverseasCryptoPriceHistorySeeder {
  private readonly logger = new Logger(OverseasCryptoPriceHistorySeeder.name);
  private readonly API_URL = 'https://api.binance.com/api/v3/klines';

  constructor(
    @InjectRepository(CryptoInfo)
    private readonly cryptoInfoRepo: Repository<CryptoInfo>,
    @InjectRepository(CryptoPriceHistory)
    private readonly cryptoPriceHistoryRepo: Repository<CryptoPriceHistory>,
  ) {}

  async run() {
    this.logger.log('🏦 Starting Overseas Crypto Price History Seeder...');

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
    }
  }

  private async getCryptoInfos() {
    const cryptoInfos = await this.cryptoInfoRepo.find({
      where: { crypto_market_id: 2 },
    });
    return cryptoInfos;
  }

  private async fetchAndSaveCryptoPriceHistory(ticker: string) {
    try {
      const cryptoInfo = await this.cryptoInfoRepo.findOne({
        where: { ticker },
      });

      if (!cryptoInfo) {
        this.logger.warn(`❌ Crypto info not found for ticker: ${ticker}`);
        return;
      }

      const priceData = await this.fetchPriceData(ticker);
      //   console.log(response);
      for (const data of priceData) {
        const dateString = new Date(data[0]).toISOString().split('T')[0];

        const priceHistory = new CryptoPriceHistory();
        priceHistory.crypto_info_id = cryptoInfo.id;
        priceHistory.date = dateString;
        priceHistory.open = data[1];
        priceHistory.high = data[2];
        priceHistory.low = data[3];
        priceHistory.close = data[4];
        priceHistory.volume = data[5];

        await this.cryptoPriceHistoryRepo.upsert(priceHistory, [
          'crypto_info_id',
          'date',
        ]);

        this.logger.log(
          `✅ Successfully processed price history for ${ticker} on ${dateString}`,
        );
      }

      this.logger.log(`✅ Successfully processed price history for ${ticker}`);
    } catch (error) {
      this.logger.error(`❌ Error processing ${ticker}:`, error.message);
    }
  }

  private async fetchPriceData(ticker: string) {
    const response = await axios.get(this.API_URL, {
      params: {
        symbol: `${ticker}USDT`,
        interval: '1d',
        limit: '2',
      },
    });
    return response.data;
  }
}
