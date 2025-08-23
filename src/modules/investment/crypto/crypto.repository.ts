import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoInfo } from 'src/database/entities/crypto/crypto-info.entity';
import { CryptoPriceHistory } from 'src/database/entities/crypto/crypto-price-history.entity';
import { Repository } from 'typeorm';
import { CryptoMarketData } from 'src/database/entities/crypto/crypto-market-data.entity';
import { CryptoMarket } from 'src/database/entities/crypto/crypto-market.entity';

@Injectable()
export class CryptoRepository {
  constructor(
    @InjectRepository(CryptoInfo)
    private cryptoInfoRepository: Repository<CryptoInfo>,
    @InjectRepository(CryptoMarket)
    private cryptoMarketRepository: Repository<CryptoMarket>,
    @InjectRepository(CryptoMarketData)
    private cryptoMarketDataRepository: Repository<CryptoMarketData>,
    @InjectRepository(CryptoPriceHistory)
    private cryptoPriceHistoryRepository: Repository<CryptoPriceHistory>,
  ) {}

  async findCryptoInfo(crypto_id: number) {
    const cryptoInfo = await this.cryptoInfoRepository.findOne({
      where: { id: crypto_id },
      relations: ['crypto_market_data', 'crypto_market'],
    });

    if (!cryptoInfo) {
      return null;
    }

    return {
      ticker: cryptoInfo.ticker,
      kor_name: cryptoInfo.kor_name,
      eng_name: cryptoInfo.eng_name,
      market: cryptoInfo.crypto_market.market_name,
      price: cryptoInfo.crypto_market_data.price,
      change_price: cryptoInfo.crypto_market_data.change_price,
      change_rate: cryptoInfo.crypto_market_data.change_rate,
    };
  }
}
