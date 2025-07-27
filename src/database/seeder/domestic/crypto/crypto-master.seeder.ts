import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoInfo } from '../../../entities/crypto/crypto-info.entity';
import { CryptoMarket } from '../../../entities/crypto/crypto-market.entity';
import axios from 'axios';

// API 응답 타입 정의
interface CryptoApiResponse {
  market: string; // "KRW-BTC"
  korean_name: string; // "비트코인"
  english_name: string; // "Bitcoin"
}

@Injectable()
export class CryptoMasterSeeder {
  private readonly logger = new Logger(CryptoMasterSeeder.name);
  private readonly API_URL = 'https://api.bithumb.com/v1/market/all';

  constructor(
    @InjectRepository(CryptoInfo)
    private readonly cryptoInfoRepo: Repository<CryptoInfo>,
    @InjectRepository(CryptoMarket)
    private readonly cryptoMarketRepo: Repository<CryptoMarket>,
  ) {}

  async run() {
    this.logger.log('🏦 Starting Crypto Master Seeder...');
    await this.createDefaultMarkets();
    await this.fetchAndSaveCryptoInfo();
    this.logger.log('✅ Crypto Master Seeder completed successfully!');
  }

  private async createDefaultMarkets() {
    try {
      const existingMarkets = await this.cryptoMarketRepo.find();
      if (existingMarkets.length === 0) {
        const defaultMarkets = [
          { market_name: 'Bithumb' },
          { market_name: 'Binance' },
        ];

        for (const market of defaultMarkets) {
          const cryptoMarket = this.cryptoMarketRepo.create(market);
          await this.cryptoMarketRepo.save(cryptoMarket);
        }
        this.logger.log('✅ Default crypto markets created: Bithumb, Binance');
      } else {
        this.logger.log('ℹ️ Crypto markets already exist');
      }
    } catch (error) {
      this.logger.error('❌ Error creating default crypto markets:', error);
    }
  }

  private async fetchAndSaveCryptoInfo() {
    try {
      this.logger.log('📊 Fetching crypto info from API...');

      const response = await axios.get(this.API_URL);

      // API 응답 데이터 추출
      let cryptoData: CryptoApiResponse[] = [];

      if (Array.isArray(response.data)) {
        cryptoData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        cryptoData = response.data.data;
      } else if (response.data?.status === '0000' && response.data?.data) {
        cryptoData = response.data.data;
      } else {
        this.logger.warn('⚠️ Unexpected API response structure');
        return;
      }

      if (cryptoData.length === 0) {
        this.logger.warn('⚠️ No crypto info results from API');
        return;
      }

      this.logger.log(`📊 Found ${cryptoData.length} crypto items`);

      // Bithumb market ID 조회
      const bithumbMarket = await this.cryptoMarketRepo.findOne({
        where: { market_name: 'Bithumb' },
      });

      if (!bithumbMarket) {
        this.logger.error('❌ Bithumb market not found in database');
        return;
      }

      // API 응답을 엔티티로 매핑
      const cryptoInfos = cryptoData.map((item: CryptoApiResponse) => ({
        eng_name: item.english_name || '',
        kor_name: item.korean_name || '',
        ticker: item.market || '',
        crypto_market_id: bithumbMarket.id,
      }));

      // 유효한 데이터만 필터링
      const validCryptoInfos = cryptoInfos.filter(
        (info) => info.ticker && info.eng_name,
      );

      if (validCryptoInfos.length === 0) {
        this.logger.warn('⚠️ No valid crypto data to save');
        return;
      }

      this.logger.log(
        `💾 Saving ${validCryptoInfos.length} valid crypto records...`,
      );

      await this.cryptoInfoRepo.upsert(validCryptoInfos, ['ticker']);
      this.logger.log(
        `✅ Saved ${validCryptoInfos.length} crypto info records`,
      );
    } catch (error) {
      this.logger.error('❌ Error fetching crypto info:', error);
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `API Error: ${error.response?.status} - ${error.response?.statusText}`,
        );
      }
    }
  }
}
