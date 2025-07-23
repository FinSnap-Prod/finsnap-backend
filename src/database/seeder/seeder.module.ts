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
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtfInfo } from '../entities/etf/etf-info.entity';
import { StockInfo } from '../entities/stock/stock-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockInfo, EtfInfo])],
  providers: [
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
  ],
  exports: [
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
  ],
})
export class SeederModule {}
