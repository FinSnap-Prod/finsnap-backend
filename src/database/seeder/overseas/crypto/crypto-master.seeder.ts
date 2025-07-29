import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoInfo } from '../../../entities/crypto/crypto-info.entity';
import { CryptoMarket } from '../../../entities/crypto/crypto-market.entity';
import axios from 'axios';

@Injectable()
export class OverseasCryptoMasterSeeder {
  private readonly logger = new Logger(OverseasCryptoMasterSeeder.name);
  private readonly API_URL =
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

  constructor(
    @InjectRepository(CryptoInfo)
    private readonly cryptoInfoRepo: Repository<CryptoInfo>,
    @InjectRepository(CryptoMarket)
    private readonly cryptoMarketRepo: Repository<CryptoMarket>,
  ) {}

  async run() {
    this.logger.log('🏦 Starting Overseas Crypto Master Seeder...');
    await this.createDefaultMarkets();
    await this.fetchAndSaveCryptoInfo();
    this.logger.log('✅ Overseas Crypto Master Seeder completed successfully!');
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

      const response = await axios.get(this.API_URL, {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
        },
        params: {
          start: '1',
          limit: '200',
        },
      });

      if (response.status !== 200) {
        this.logger.error(
          `❌ API Error: ${response.status} - ${response.statusText}`,
        );
        return;
      }

      const cryptoData = response.data.data;

      if (cryptoData.length === 0) {
        this.logger.warn('⚠️ No crypto info results from API');
        return;
      }

      this.logger.log(`📊 Found ${cryptoData.length} crypto items`);

      const binanceMarket = await this.cryptoMarketRepo.findOne({
        where: { market_name: 'Binance' },
      });

      if (!binanceMarket) {
        this.logger.error('❌ Binance market not found in database');
        return;
      }

      const cryptoInfos = cryptoData.map((item) => ({
        eng_name: item.name,
        kor_name: item.name,
        ticker: item.symbol,
        crypto_market_id: binanceMarket.id,
      }));

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
    }
  }
}
