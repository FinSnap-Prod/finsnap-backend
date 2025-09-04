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
import { DepositMasterSeeder } from './domestic/deposit/deposit-master.seeder';
import { SavingMasterSeeder } from './domestic/deposit/saving-master.seeder';
import { CryptoMasterSeeder } from './domestic/crypto/crypto-master.seeder';
import { CryptoMarketSeeder } from './domestic/crypto/crypto-market.seeder';
import { CryptoPriceHistorySeeder } from './domestic/crypto/crypto-price-history.seeder';
import { OverseasCryptoMasterSeeder } from './overseas/crypto/crypto-master.seeder';
import { OverseasCryptoMarketSeeder } from './overseas/crypto/crypto-market.seeder';
import { OverseasCryptoPriceHistorySeeder } from './overseas/crypto/crpyto-price-history.seeder';
import { CodeMasterSeeder } from './code-master.seeder';
import { AssetIndexSeeder } from './asset-index.seeder';
import { ExchangeSeeder } from './exchange/exchange.seeder';

// 지연 함수
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Seeder 실행 함수
const runSeeder = async (seeder: any, name: string) => {
  await seeder.run();
  console.log(`✅ ${name} finished.`);
  await delay(1000);
};

async function bootstrap() {
  console.time('All Seeding finished in');
  const app = await NestFactory.createApplicationContext(AppModule);

  // Seeder 인스턴스들
  const seeders = {
    codeMaster: app.get(CodeMasterSeeder),
    assetIndex: app.get(AssetIndexSeeder),
    kospiMaster: app.get(KospiMasterSeeder),
    kosdaqMaster: app.get(KosdaqMasterSeeder),
    overseasMaster: app.get(OverseasMasterSeeder),
    stockMarket: app.get(StockMarketSeeder),
    etfMarket: app.get(EtfMarketSeeder),
    overseasStockMarket: app.get(OverseasStockMarketSeeder),
    overseasEtfMarket: app.get(OverseasEtfMarketSeeder),
    stockPriceHistory: app.get(StockPriceHistorySeeder),
    etfPriceHistory: app.get(EtfPriceHistorySeeder),
    overseasStockPriceHistory: app.get(OverseasStockPriceHistorySeeder),
    overseasEtfPriceHistory: app.get(OverseasEtfPriceHistorySeeder),
    etfComponent: app.get(EtfComponentSeeder),
    depositMaster: app.get(DepositMasterSeeder),
    savingMaster: app.get(SavingMasterSeeder),
    cryptoMaster: app.get(CryptoMasterSeeder),
    cryptoMarket: app.get(CryptoMarketSeeder),
    cryptoPriceHistory: app.get(CryptoPriceHistorySeeder),
    overseasCryptoMaster: app.get(OverseasCryptoMasterSeeder),
    overseasCryptoMarket: app.get(OverseasCryptoMarketSeeder),
    overseasCryptoPriceHistory: app.get(OverseasCryptoPriceHistorySeeder),
    exchange: app.get(ExchangeSeeder),
  };

  console.log('--- All Seeders Start (Sequential Processing) ---');

  // 0. Code Master Data (가장 먼저 실행)
  console.log('0️⃣ Running code master seeder...');
  await runSeeder(seeders.codeMaster, 'Code master seeder');
  console.log('✅ Code master seeder finished.');

  // 7. Exchange Rates (KRW-based FX)
  console.log('7️⃣ Running exchange rate seeder...');
  await runSeeder(seeders.exchange, 'Exchange rate seeder');
  console.log('✅ Exchange rate seeder finished.');

  // 1. Master Data
  console.log('1️⃣ Running master data seeders...');
  const masterSeeders = [
    { seeder: seeders.kospiMaster, name: 'KOSPI master seeder' },
    { seeder: seeders.kosdaqMaster, name: 'KOSDAQ master seeder' },
    { seeder: seeders.overseasMaster, name: 'Overseas master seeder' },
  ];

  for (const { seeder, name } of masterSeeders) {
    await runSeeder(seeder, name);
  }
  console.log('✅ All master data seeders finished.');

  // 2. Market Data
  console.log('2️⃣ Running market data seeders...');
  const marketSeeders = [
    { seeder: seeders.stockMarket, name: 'Domestic stock market seeder' },
    { seeder: seeders.etfMarket, name: 'Domestic ETF market seeder' },
    {
      seeder: seeders.overseasStockMarket,
      name: 'Overseas stock market seeder',
    },
    { seeder: seeders.overseasEtfMarket, name: 'Overseas ETF market seeder' },
  ];

  for (const { seeder, name } of marketSeeders) {
    await runSeeder(seeder, name);
  }
  console.log('✅ All market data seeders finished.');

  // 3. Price History
  console.log('3️⃣ Running price history seeders...');
  const priceHistorySeeders = [
    {
      seeder: seeders.stockPriceHistory,
      name: 'Domestic stock price history seeder',
    },
    {
      seeder: seeders.etfPriceHistory,
      name: 'Domestic ETF price history seeder',
    },
    {
      seeder: seeders.overseasStockPriceHistory,
      name: 'Overseas stock price history seeder',
    },
    {
      seeder: seeders.overseasEtfPriceHistory,
      name: 'Overseas ETF price history seeder',
    },
  ];

  for (const { seeder, name } of priceHistorySeeders) {
    await runSeeder(seeder, name);
  }
  console.log('✅ All price history seeders finished.');

  // 4. ETF Component
  console.log('4️⃣ Running ETF component seeders...');
  await runSeeder(seeders.etfComponent, 'ETF component seeder');

  // 5. Deposit
  console.log('5️⃣ Running deposit seeders...');
  await runSeeder(seeders.depositMaster, 'Deposit master seeder');
  await runSeeder(seeders.savingMaster, 'Saving master seeder');

  // 6. Crypto
  console.log('6️⃣ Running crypto seeders...');
  await runSeeder(seeders.cryptoMaster, 'Crypto master seeder');
  await runSeeder(seeders.cryptoMarket, 'Crypto market seeder');
  await runSeeder(seeders.cryptoPriceHistory, 'Crypto price history seeder');
  await runSeeder(
    seeders.overseasCryptoMaster,
    'Overseas crypto master seeder',
  );
  await runSeeder(
    seeders.overseasCryptoMarket,
    'Overseas crypto market seeder',
  );
  await runSeeder(
    seeders.overseasCryptoPriceHistory,
    'Overseas crypto price history seeder',
  );

  console.log('0️⃣.5️⃣ Running asset index seeder...');
  await runSeeder(seeders.assetIndex, 'Asset index seeder');
  console.log('✅ Asset index seeder finished.');

  await app.close();
  console.log('--- All Seeders End ---');
  console.timeEnd('All Seeding finished in');
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ All seeders error:', err);
  process.exit(1);
});
