import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { KospiMasterSeeder } from './kospi-master.seeder';
import { KosdaqMasterSeeder } from './kosdaq-master.seeder';
import { StockMarketSeeder } from './stock/stock-market.seeder';
import { EtfMarketSeeder } from './etf/etf-market.seeder';
import { EtfPriceHistorySeeder } from './etf/etf-price-history.seeder';
import { StockPriceHistorySeeder } from './stock/stock-price-history.seeder';
import { EtfComponentSeeder } from './etf/etf-component.seeder';

async function bootstrap() {
  console.time('Seeding finished in');
  const app = await NestFactory.createApplicationContext(AppModule);
  const kospiMasterSeeder = app.get(KospiMasterSeeder); // kospi-master.xlsx 정재 -> StockInfo, EtfInfo 적재
  const kosdaqMasterSeeder = app.get(KosdaqMasterSeeder); // kosdaq-master.xlsx 정재 -> StockInfo 적재
  const stockMarketSeeder = app.get(StockMarketSeeder); // StockInfo -> Kis-API -> StockMarketData 적재
  const etfMarketSeeder = app.get(EtfMarketSeeder); // EtfInfo -> Kis-API -> EtfMarketData 적재
  const stockPriceHistorySeeder = app.get(StockPriceHistorySeeder); // StockInfo -> Kis-API -> StockPriceHisotry 적재
  const etfPriceHistorySeeder = app.get(EtfPriceHistorySeeder); // EtfInfo -> Kis-API -> EtfPriceHistory 적재
  const etfComponentSeeder = app.get(EtfComponentSeeder); // EtfInfo -> Kis-API -> find(StockInfo) -> EtfComponent 적재

  console.log('--- Domestic Seeder Start ---');

  console.log('Running master data seeders...');
  await kospiMasterSeeder.run();
  await kosdaqMasterSeeder.run();
  console.log('✅ Master data seeders finished.');

  console.log('Running market data seeders in parallel...');
  await Promise.all([stockMarketSeeder.run(), etfMarketSeeder.run()]);
  console.log('✅ Market data seeders finished.');

  console.log('Running pricehistory seeders in parallel...');
  await Promise.all([
    stockPriceHistorySeeder.run(),
    etfPriceHistorySeeder.run(),
  ]);
  console.log('✅ prciehistory data seeders finished.');

  console.log('Running etfcomponent seeders in parallel...');
  await etfComponentSeeder.run();
  console.log('✅ etfcomponent data seeders finished.');

  await app.close();
  console.log('--- Domestic Seeder End ---');
  console.timeEnd('Seeding finished in');
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ domestic seeders error:', err);
  process.exit(1);
});
