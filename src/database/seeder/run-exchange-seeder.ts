import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { ExchangeSeeder } from './exchange/exchange.seeder';

async function bootstrap() {
  console.time('Exchange seeding finished in');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seeder = app.get(ExchangeSeeder);
    await seeder.run();
    console.log('✅ Exchange seeder finished.');
  } catch (e) {
    console.error('❌ Exchange seeder failed:', e);
    process.exitCode = 1;
  } finally {
    await app.close();
    console.timeEnd('Exchange seeding finished in');
  }
}

bootstrap();

