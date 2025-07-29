import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { OverseasCryptoMasterSeeder } from './crypto-master.seeder';
import { OverseasCryptoMarketSeeder } from './crypto-market.seeder';
import { OverseasCryptoPriceHistorySeeder } from './crpyto-price-history.seeder';

async function bootstrap() {
  console.time('🏦 Crypto Seeder Execution Time');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const overseasCryptoMasterSeeder = app.get(OverseasCryptoMasterSeeder);
    const overseasCryptoMarketSeeder = app.get(OverseasCryptoMarketSeeder);
    const overseasCryptoPriceHistorySeeder = app.get(
      OverseasCryptoPriceHistorySeeder,
    );

    await overseasCryptoMasterSeeder.run();
    await overseasCryptoMarketSeeder.run();
    await overseasCryptoPriceHistorySeeder.run();

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
