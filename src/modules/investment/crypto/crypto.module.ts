import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { CryptoRepository } from './crypto.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoInfo } from 'src/database/entities/crypto/crypto-info.entity';
import { CryptoMarketData } from 'src/database/entities/crypto/crypto-market-data.entity';
import { CryptoMarket } from 'src/database/entities/crypto/crypto-market.entity';
import { CryptoPriceHistory } from 'src/database/entities/crypto/crypto-price-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CryptoInfo,
      CryptoMarketData,
      CryptoMarket,
      CryptoPriceHistory,
    ]),
  ],
  controllers: [CryptoController],
  providers: [CryptoService, CryptoRepository],
  exports: [CryptoRepository],
})
export class CryptoModule {}
