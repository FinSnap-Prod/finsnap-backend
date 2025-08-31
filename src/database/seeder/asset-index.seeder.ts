import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { Asset } from 'src/database/entities/asset/asset.entity';
import { StockInfo } from 'src/database/entities/stock/stock-info.entity';
import { EtfInfo } from 'src/database/entities/etf/etf-info.entity';
import { CryptoInfo } from 'src/database/entities/crypto/crypto-info.entity';
import { DepositInfo } from 'src/database/entities/deposit/deposit-info.entity';

@Injectable()
export class AssetIndexSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('🚀 Starting Asset Index Seeder...');

      // 1. Stock Info 매핑
      await this.mapStockInfo(queryRunner);

      // 2. ETF Info 매핑
      await this.mapEtfInfo(queryRunner);

      // 3. Crypto Info 매핑
      await this.mapCryptoInfo(queryRunner);

      // 4. Deposit Info 매핑
      await this.mapDepositInfo(queryRunner);

      await queryRunner.commitTransaction();
      console.log('✅ Asset Index Seeder completed successfully!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Asset Index Seeder failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async mapStockInfo(queryRunner: QueryRunner): Promise<void> {
    console.log('📊 Mapping Stock Info to Asset...');

    const stockInfos = await queryRunner.manager.find(StockInfo, {
      relations: ['stock_market_data'],
    });

    for (const stockInfo of stockInfos) {
      // market_region_id 계산 (stock_info의 market 필드 사용)
      let marketRegionId = 1; // 기본값: 국내
      if (
        stockInfo.market === 'NASDAQ' ||
        stockInfo.market === 'NYSE' ||
        stockInfo.market === 'AMEX'
      ) {
        marketRegionId = 2; // 해외
      }

      // 중복 체크
      const existingAsset = await queryRunner.manager.findOne(Asset, {
        where: {
          asset_type_id: 1, // STOCK
          asset_info_id: stockInfo.id,
        },
      });

      if (!existingAsset) {
        const asset = queryRunner.manager.create(Asset, {
          asset_type_id: 1, // STOCK
          market_region_id: marketRegionId,
          asset_info_id: stockInfo.id,
        });

        await queryRunner.manager.save(asset);
        console.log(
          `✅ Created Asset for Stock: ${stockInfo.kor_name} (ID: ${stockInfo.id})`,
        );
      }
    }

    console.log(`📊 Mapped ${stockInfos.length} stock records`);
  }

  private async mapEtfInfo(queryRunner: QueryRunner): Promise<void> {
    console.log('📈 Mapping ETF Info to Asset...');

    const etfInfos = await queryRunner.manager.find(EtfInfo, {
      relations: ['etf_market_data'],
    });

    for (const etfInfo of etfInfos) {
      // market_region_id 계산 (etf_info의 market 필드 사용)
      let marketRegionId = 1; // 기본값: 국내
      if (
        etfInfo.market === 'NASDAQ' ||
        etfInfo.market === 'NYSE' ||
        etfInfo.market === 'AMEX'
      ) {
        marketRegionId = 2; // 해외
      }

      // 중복 체크
      const existingAsset = await queryRunner.manager.findOne(Asset, {
        where: {
          asset_type_id: 2, // ETF
          asset_info_id: etfInfo.id,
        },
      });

      if (!existingAsset) {
        const asset = queryRunner.manager.create(Asset, {
          asset_type_id: 2, // ETF
          market_region_id: marketRegionId,
          asset_info_id: etfInfo.id,
        });

        await queryRunner.manager.save(asset);
        console.log(
          `✅ Created Asset for ETF: ${etfInfo.kor_name} (ID: ${etfInfo.id})`,
        );
      }
    }

    console.log(`📈 Mapped ${etfInfos.length} ETF records`);
  }

  private async mapCryptoInfo(queryRunner: QueryRunner): Promise<void> {
    console.log('₿ Mapping Crypto Info to Asset...');

    const cryptoInfos = await queryRunner.manager.find(CryptoInfo);

    for (const cryptoInfo of cryptoInfos) {
      // market_region_id 계산 (crypto_market_id 기반)
      const marketRegionId = cryptoInfo.crypto_market_id === 1 ? 1 : 2;

      // 중복 체크
      const existingAsset = await queryRunner.manager.findOne(Asset, {
        where: {
          asset_type_id: 3, // CRYPTO
          asset_info_id: cryptoInfo.id,
        },
      });

      if (!existingAsset) {
        const asset = queryRunner.manager.create(Asset, {
          asset_type_id: 3, // CRYPTO
          market_region_id: marketRegionId,
          asset_info_id: cryptoInfo.id,
        });

        await queryRunner.manager.save(asset);
        console.log(
          `✅ Created Asset for Crypto: ${cryptoInfo.kor_name} (ID: ${cryptoInfo.id})`,
        );
      }
    }

    console.log(`₿ Mapped ${cryptoInfos.length} crypto records`);
  }

  private async mapDepositInfo(queryRunner: QueryRunner): Promise<void> {
    console.log('🏦 Mapping Deposit Info to Asset...');

    const depositInfos = await queryRunner.manager.find(DepositInfo);

    for (const depositInfo of depositInfos) {
      // deposit은 모두 국내
      const marketRegionId = 1;

      // 중복 체크
      const existingAsset = await queryRunner.manager.findOne(Asset, {
        where: {
          asset_type_id: 4, // DEPOSIT
          asset_info_id: depositInfo.id,
        },
      });

      if (!existingAsset) {
        const asset = queryRunner.manager.create(Asset, {
          asset_type_id: 4, // DEPOSIT
          market_region_id: marketRegionId,
          asset_info_id: depositInfo.id,
        });

        await queryRunner.manager.save(asset);
        console.log(
          `✅ Created Asset for Deposit: ${depositInfo.kor_name} (ID: ${depositInfo.id})`,
        );
      }
    }

    console.log(`🏦 Mapped ${depositInfos.length} deposit records`);
  }
}
