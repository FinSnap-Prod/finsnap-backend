import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { KospiMasterSeeder } from './domestic/kospi-master.seeder';
import { KosdaqMasterSeeder } from './domestic/kosdaq-master.seeder';
import { StockMarketSeeder } from './domestic/stock/stock-market.seeder';
import { EtfMarketSeeder } from './domestic/etf/etf-market.seeder';
import { StockPriceHistorySeeder } from './domestic/stock/stock-price-history.seeder';
import { EtfPriceHistorySeeder } from './domestic/etf/etf-price-history.seeder';
import { EtfComponentSeeder } from './domestic/etf/etf-component.seeder';
import { OverseasMasterSeeder } from './overseas/overseas-master.seeder';
import { OverseasStockMarketSeeder } from './overseas/stock/stock-market.seeder';
import { OverseasEtfMarketSeeder } from './overseas/etf/eft-market.seeder';
import { OverseasStockPriceHistorySeeder } from './overseas/stock/stock-price.history.seeder';
import { OverseasEtfPriceHistorySeeder } from './overseas/etf/etf-price-history.seeder';

// 지연 함수 추가
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function bootstrap() {
  console.time('All Seeding finished in');
  const app = await NestFactory.createApplicationContext(AppModule);

  // Domestic Seeders
  const kospiMasterSeeder = app.get(KospiMasterSeeder);
  const kosdaqMasterSeeder = app.get(KosdaqMasterSeeder);
  const stockMarketSeeder = app.get(StockMarketSeeder);
  const etfMarketSeeder = app.get(EtfMarketSeeder);
  const stockPriceHistorySeeder = app.get(StockPriceHistorySeeder);
  const etfPriceHistorySeeder = app.get(EtfPriceHistorySeeder);
  const etfComponentSeeder = app.get(EtfComponentSeeder);

  // Overseas Seeders
  const overseasMasterSeeder = app.get(OverseasMasterSeeder);
  const overseasStockMarketSeeder = app.get(OverseasStockMarketSeeder);
  const overseasEtfMarketSeeder = app.get(OverseasEtfMarketSeeder);
  const overseasStockPriceHistorySeeder = app.get(
    OverseasStockPriceHistorySeeder,
  );
  const overseasEtfPriceHistorySeeder = app.get(OverseasEtfPriceHistorySeeder);

  console.log('--- All Seeders Start (Sequential Processing) ---');

  // 1. Master Data (순차 실행)
  console.log('1️⃣ Running master data seeders...');
  await kospiMasterSeeder.run();
  console.log('✅ KOSPI master seeder finished.');

  await delay(1000); // 1초 대기

  await kosdaqMasterSeeder.run();
  console.log('✅ KOSDAQ master seeder finished.');

  await delay(1000); // 1초 대기

  await overseasMasterSeeder.run();
  console.log('✅ Overseas master seeder finished.');
  console.log('✅ All master data seeders finished.');

  // 2. Market Data (순차 실행)
  console.log('2️⃣ Running market data seeders sequentially...');
  await stockMarketSeeder.run();
  console.log('✅ Domestic stock market seeder finished.');

  await delay(1000); // 1초 대기

  await etfMarketSeeder.run();
  console.log('✅ Domestic ETF market seeder finished.');

  await delay(1000); // 1초 대기

  await overseasStockMarketSeeder.run();
  console.log('✅ Overseas stock market seeder finished.');

  await delay(1000); // 1초 대기

  await overseasEtfMarketSeeder.run();
  console.log('✅ Overseas ETF market seeder finished.');
  console.log('✅ All market data seeders finished.');

  // 3. Price History (순차 실행)
  console.log('3️⃣ Running price history seeders sequentially...');
  await stockPriceHistorySeeder.run();
  console.log('✅ Domestic stock price history seeder finished.');

  await delay(1000); // 1초 대기

  await etfPriceHistorySeeder.run();
  console.log('✅ Domestic ETF price history seeder finished.');

  await delay(1000); // 1초 대기

  await overseasStockPriceHistorySeeder.run();
  console.log('✅ Overseas stock price history seeder finished.');

  await delay(1000); // 1초 대기

  await overseasEtfPriceHistorySeeder.run();
  console.log('✅ Overseas ETF price history seeder finished.');
  console.log('✅ All price history seeders finished.');

  // 4. ETF Component (순차 실행)
  console.log('4️⃣ Running ETF component seeders...');
  await etfComponentSeeder.run();
  console.log('✅ ETF component seeders finished.');

  await app.close();
  console.log('--- All Seeders End ---');
  console.timeEnd('All Seeding finished in');
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ All seeders error:', err);
  process.exit(1);
});
