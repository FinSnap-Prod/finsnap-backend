import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { DepositMasterSeeder } from './deposit-master.seeder';
import { SavingMasterSeeder } from './saving-master.seeder';

async function bootstrap() {
  console.time('🏦 Deposit & Saving Seeder Execution Time');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const depositMasterSeeder = app.get(DepositMasterSeeder);
    await depositMasterSeeder.run();
    const savingMasterSeeder = app.get(SavingMasterSeeder);
    await savingMasterSeeder.run();

    console.timeEnd('🏦 Deposit & Saving Seeder Execution Time');
    console.log('✅ Deposit & Saving Master Seeder completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Deposit & Saving Master Seeder failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
