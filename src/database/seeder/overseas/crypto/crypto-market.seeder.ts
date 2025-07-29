import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoInfo } from '../../../entities/crypto/crypto-info.entity';
import { CryptoMarketData } from '../../../entities/crypto/crypto-market-data.entity';
import { Repository } from 'typeorm';
import axios from 'axios';

@Injectable()
export class OverseasCryptoMarketSeeder {
  private readonly logger = new Logger(OverseasCryptoMarketSeeder.name);
  private readonly API_URL = 'https://api.binance.com/api/v3/ticker/tradingDay';

  constructor(
    @InjectRepository(CryptoInfo)
    private readonly cryptoInfoRepo: Repository<CryptoInfo>,
    @InjectRepository(CryptoMarketData)
    private readonly cryptoMarketDataRepo: Repository<CryptoMarketData>,
  ) {}

  async run() {
    this.logger.log('🏦 Starting Overseas Crypto Market Seeder...');
    await this.fetchAndSaveCryptoMarketData();
    this.logger.log('✅ Overseas Crypto Market Seeder completed successfully!');
  }

  async fetchAndSaveCryptoMarketData() {
    try {
      this.logger.log('📊 Fetching crypto market data from Binance API...');

      // crypto_market_id가 2(Binance)인 ticker들 조회
      const binanceCryptos = await this.cryptoInfoRepo.find({
        where: { crypto_market_id: 2 },
        select: ['id', 'ticker'],
      });

      if (binanceCryptos.length === 0) {
        this.logger.warn('⚠️ No Binance crypto data found');
        return;
      }

      this.logger.log(`📊 Found ${binanceCryptos.length} Binance crypto items`);

      // 각 ticker에 대해 USDT 페어로 API 요청
      for (let i = 0; i < binanceCryptos.length; i++) {
        const crypto = binanceCryptos[i];
        const symbol = `${crypto.ticker}USDT`; // ticker 뒤에 USDT 추가

        this.logger.log(
          `🔄 Processing ${i + 1}/${binanceCryptos.length}: ${symbol}`,
        );

        try {
          const response = await axios.get(this.API_URL, {
            params: {
              symbol: symbol,
            },
          });

          // API 응답 처리
          await this.processApiResponse(response, crypto);

          // API 호출 간격 조절 (Rate limiting 방지)
          if (i < binanceCryptos.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100)); // 0.1초 간격
          }
        } catch (error) {
          if (error.response?.status === 400) {
            this.logger.warn(`⚠️ Symbol ${symbol} not found on Binance`);
          } else {
            this.logger.error(`❌ Error processing ${symbol}:`, error.message);
          }
        }
      }

      this.logger.log('✅ All crypto market data processed');
    } catch (error) {
      this.logger.error('❌ Error in fetchAndSaveCryptoMarketData:', error);
    }
  }

  private async processApiResponse(response: any, crypto: any) {
    try {
      const data = response.data;

      if (!data) {
        this.logger.warn(`⚠️ No data in API response for ${crypto.ticker}`);
        return;
      }

      // CryptoMarketData에 저장
      const marketDataEntity = new CryptoMarketData();
      marketDataEntity.crypto_info_id = crypto.id;
      marketDataEntity.price = data.lastPrice;
      marketDataEntity.change_price = data.priceChange;
      marketDataEntity.change_rate = data.priceChangePercent;
      marketDataEntity.acc_trade_volume = data.volume;
      marketDataEntity.acc_trade_price = data.quoteVolume;
      marketDataEntity.market_cap = '0';

      // upsert로 저장 (unique constraint 기반)
      await this.cryptoMarketDataRepo.upsert(marketDataEntity, [
        'crypto_info_id',
      ]);

      this.logger.log(
        `✅ Processed ${crypto.ticker}: $${data.lastPrice} (${data.priceChangePercent}%)`,
      );

      // 디버깅용: 처음 몇 개만 상세 로그
      if (crypto.ticker === 'BTC' || crypto.ticker === 'ETH') {
        this.logger.log(`🔍 Detailed data for ${crypto.ticker}:`, {
          symbol: data.symbol,
          lastPrice: data.lastPrice,
          volume: data.volume,
          openTime: new Date(data.openTime).toISOString(),
          closeTime: new Date(data.closeTime).toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(
        `❌ Error processing API response for ${crypto.ticker}:`,
        error,
      );
    }
  }
}
