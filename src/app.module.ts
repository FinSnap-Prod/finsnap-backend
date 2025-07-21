import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OauthModule } from './modules/oauth/oauth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './config/typeorm.config';
import { KospiMasterSeeder } from './database/seeder/domestic/kospi-master.seeder';
import { StockInfo } from './database/entities/stock/stock-info.entity';
import { EtfInfo } from './database/entities/etf/etf-info.entity';
import { KosdaqMasterSeeder } from './database/seeder/domestic/kosdaq-master.seeder';
import { StockMarketSeeder } from './database/seeder/domestic/stock-market.seeder';
import { EtfMarketSeeder } from './database/seeder/domestic/etf-market.seeder';
import { EtfPriceHistorySeeder } from './database/seeder/domestic/etf-price-history.seeder';
import { StockPriceHistorySeeder } from './database/seeder/domestic/stock-price-history.seeder';
import { EtfComponentSeeder } from './database/seeder/domestic/etf-component.seeder';

@Module({
  imports: [
    OauthModule,
    TypeOrmModule.forRoot(typeORMConfig),
    TypeOrmModule.forFeature([StockInfo, EtfInfo]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    KospiMasterSeeder,
    KosdaqMasterSeeder,
    StockMarketSeeder,
    EtfMarketSeeder,
    StockPriceHistorySeeder,
    EtfPriceHistorySeeder,
    EtfComponentSeeder,
  ],
})
export class AppModule {}
