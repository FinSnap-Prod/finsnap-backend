import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { CodeMasterSeeder } from './code-master.seeder';

async function bootstrap() {
  console.log('🚀 Starting Code Master Seeder...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const codeMasterSeeder = app.get(CodeMasterSeeder);
  await codeMasterSeeder.run();

  await app.close();
  console.log('✅ Code Master Seeder completed successfully');
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ Code Master Seeder error:', err);
  process.exit(1);
});
