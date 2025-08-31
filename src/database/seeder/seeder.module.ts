import { Module } from '@nestjs/common';
import { KospiMasterSeeder } from './domestic/kospi-master.seeder';
import { KosdaqMasterSeeder } from './domestic/kosdaq-master.seeder';
import { StockMarketSeeder } from './domestic/stock/stock-market.seeder';
import { EtfMarketSeeder } from './domestic/etf/etf-market.seeder';
import { EtfPriceHistorySeeder } from './domestic/etf/etf-price-history.seeder';
import { StockPriceHistorySeeder } from './domestic/stock/stock-price-history.seeder';
import { EtfComponentSeeder } from './domestic/etf/etf-component.seeder';
import { OverseasMasterSeeder } from './overseas/overseas-master.seeder';
import { OverseasStockMarketSeeder } from './overseas/stock/stock-market.seeder';
import { OverseasEtfMarketSeeder } from './overseas/etf/eft-market.seeder';
import { OverseasStockPriceHistorySeeder } from './overseas/stock/stock-price.history.seeder';
import { OverseasEtfPriceHistorySeeder } from './overseas/etf/etf-price-history.seeder';
import { DepositMasterSeeder } from './domestic/deposit/deposit-master.seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtfInfo } from '../entities/etf/etf-info.entity';
import { StockInfo } from '../entities/stock/stock-info.entity';
import { DepositInfo } from '../entities/deposit/deposit-info.entity';
import { DepositType } from '../entities/deposit/deposit-type.entity';
import { DepositMarketData } from '../entities/deposit/deposit-market-data.entity';
import { InterestType } from '../entities/code/interest-type.entity';
import { SavingMasterSeeder } from './domestic/deposit/saving-master.seeder';
import { CryptoMasterSeeder } from './domestic/crypto/crypto-master.seeder';
import { CryptoMarketSeeder } from './domestic/crypto/crypto-market.seeder';
import { CryptoInfo } from '../entities/crypto/crypto-info.entity';
import { CryptoMarket } from '../entities/crypto/crypto-market.entity';
import { CryptoMarketData } from '../entities/crypto/crypto-market-data.entity';
import { CryptoPriceHistory } from '../entities/crypto/crypto-price-history.entity';
import { CryptoPriceHistorySeeder } from './domestic/crypto/crypto-price-history.seeder';
import { OverseasCryptoMasterSeeder } from './overseas/crypto/crypto-master.seeder';
import { OverseasCryptoMarketSeeder } from './overseas/crypto/crypto-market.seeder';
import { OverseasCryptoPriceHistorySeeder } from './overseas/crypto/crpyto-price-history.seeder';
import { AssetType } from '../entities/code/asset-type.entity';
import { AssetHistoryType } from '../entities/code/asset-history-type.entity';
import { CurrencyCode } from '../entities/code/currency-code.entity';
import { Institution } from '../entities/code/institution.entity';
import { MarketRegion } from '../entities/code/market-region.entity';
import { Asset } from '../entities/asset/asset.entity';
import { CodeMasterSeeder } from './code-master.seeder';
import { AssetIndexSeeder } from './asset-index.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockInfo,
      EtfInfo,
      DepositInfo,
      DepositType,
      DepositMarketData,
      InterestType,
      CryptoInfo,
      CryptoMarket,
      CryptoMarketData,
      CryptoPriceHistory,
      AssetType,
      AssetHistoryType,
      CurrencyCode,
      Institution,
      InterestType,
      MarketRegion,
      Asset,
    ]),
  ],
  providers: [
    CodeMasterSeeder,
    AssetIndexSeeder,
    KospiMasterSeeder,
    KosdaqMasterSeeder,
    StockMarketSeeder,
    EtfMarketSeeder,
    StockPriceHistorySeeder,
    EtfPriceHistorySeeder,
    EtfComponentSeeder,
    OverseasMasterSeeder,
    OverseasStockMarketSeeder,
    OverseasEtfMarketSeeder,
    OverseasStockPriceHistorySeeder,
    OverseasEtfPriceHistorySeeder,
    DepositMasterSeeder,
    SavingMasterSeeder,
    CryptoMasterSeeder,
    CryptoMarketSeeder,
    CryptoPriceHistorySeeder,
    OverseasCryptoMasterSeeder,
    OverseasCryptoMarketSeeder,
    OverseasCryptoPriceHistorySeeder,
  ],
  exports: [
    CodeMasterSeeder,
    AssetIndexSeeder,
    KospiMasterSeeder,
    KosdaqMasterSeeder,
    StockMarketSeeder,
    EtfMarketSeeder,
    StockPriceHistorySeeder,
    EtfPriceHistorySeeder,
    EtfComponentSeeder,
    OverseasMasterSeeder,
    OverseasStockMarketSeeder,
    OverseasEtfMarketSeeder,
    OverseasStockPriceHistorySeeder,
    OverseasEtfPriceHistorySeeder,
    DepositMasterSeeder,
    SavingMasterSeeder,
    CryptoMasterSeeder,
    CryptoMarketSeeder,
    CryptoPriceHistorySeeder,
    OverseasCryptoMasterSeeder,
    OverseasCryptoMarketSeeder,
    OverseasCryptoPriceHistorySeeder,
  ],
})
export class SeederModule {}
