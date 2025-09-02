import { Injectable } from '@nestjs/common';
import { AssetHistory } from 'src/database/entities/portfolio/asset-history.entity';
import { UserAsset } from 'src/database/entities/portfolio/user-asset.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class AssetRepository {
  constructor(private readonly dataSource: DataSource) {}

  async deleteAsset(userAssetId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. AssetHistory 삭제
      await queryRunner.manager.delete(AssetHistory, {
        user_asset_id: userAssetId,
      });

      // 2. UserAsset 삭제
      await queryRunner.manager.delete(UserAsset, {
        id: userAssetId,
      });

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
