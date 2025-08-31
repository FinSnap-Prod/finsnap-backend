import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { AssetIndexSeeder } from './asset-index.seeder';

async function bootstrap() {
  console.time('Asset Index Seeding finished in');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const assetIndexSeeder = app.get(AssetIndexSeeder);
    await assetIndexSeeder.run();
    console.log('✅ Asset Index Seeder completed successfully!');
  } catch (error) {
    console.error('❌ Asset Index Seeder failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    console.timeEnd('Asset Index Seeding finished in');
    process.exit(0);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Asset Index Seeder error:', err);
  process.exit(1);
});
