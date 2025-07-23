import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { OverseasMasterSeeder } from './overseas-master.seeder';
import { OverseasStockMarketSeeder } from './stock/stock-market.seeder';
import { OverseasEtfMarketSeeder } from './etf/eft-market.seeder';
import { OverseasStockPriceHistorySeeder } from './stock/stock-price.history.seeder';
import { OverseasEtfPriceHistorySeeder } from './etf/etf-price-history.seeder';

async function bootstrap() {
  console.time('Seeding finished in');
  const app = await NestFactory.createApplicationContext(AppModule);
  const overseasMasterSeeder = app.get(OverseasMasterSeeder);
  const overseasStockMarketSeeder = app.get(OverseasStockMarketSeeder);
  const overseasEtfMarketSeeder = app.get(OverseasEtfMarketSeeder);
  const overseasStockPriceHistorySeeder = app.get(
    OverseasStockPriceHistorySeeder,
  );
  const overseasEtfPriceHistorySeeder = app.get(OverseasEtfPriceHistorySeeder);

  console.log('--- Overseas Seeder Start ---');

  console.log('Running master data seeders...');
  await overseasMasterSeeder.run();
  console.log('✅ Master data seeders finished.');

  console.log('Running market data seeders in parallel...');
  await Promise.all([
    overseasStockMarketSeeder.run(),
    overseasEtfMarketSeeder.run(),
  ]);
  console.log('✅ Market data seeders finished.');

  console.log('Running pricehistory seeders in parallel...');
  await Promise.all([
    overseasStockPriceHistorySeeder.run(),
    overseasEtfPriceHistorySeeder.run(),
  ]);
  console.log('✅ prciehistory data seeders finished.');

  await app.close();
  console.log('--- Overseas Seeder End ---');
  console.timeEnd('Seeding finished in');
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ overseas seeders error:', err);
  process.exit(1);
});
