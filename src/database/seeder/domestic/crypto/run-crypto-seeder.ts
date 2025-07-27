import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { CryptoMasterSeeder } from './crypto-master.seeder';
import { CryptoMarketSeeder } from './crypto-market.seeder';
import { CryptoPriceHistorySeeder } from './crypto-price-history.seeder';

async function bootstrap() {
  console.time('🏦 Crypto Seeder Execution Time');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const cryptoMasterSeeder = app.get(CryptoMasterSeeder);
    const cryptoMarketSeeder = app.get(CryptoMarketSeeder);
    const cryptoPriceHistorySeeder = app.get(CryptoPriceHistorySeeder);

    await cryptoMasterSeeder.run();
    await cryptoMarketSeeder.run();
    await cryptoPriceHistorySeeder.run();

    console.timeEnd('🏦 Crypto Seeder Execution Time');
    console.log('✅ Crypto Master Seeder completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Crypto Master Seeder failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
