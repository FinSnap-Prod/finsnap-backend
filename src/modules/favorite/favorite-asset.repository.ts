import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from 'src/database/entities/favorite/favorite.entity';
import { FavoriteAsset } from 'src/database/entities/favorite/favorite-asset.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class FavoriteAssetRepository {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(FavoriteAsset)
    private favoriteAssetRepository: Repository<FavoriteAsset>,
    private dataSource: DataSource,
  ) {}

  // 폴더 존재 및 소유자 여부 조회
  async findFavoriteFolderWithUserId(favoriteId: number, userId: string) {
    return this.favoriteRepository.findOne({
      where: { id: favoriteId, user_id: userId },
    });
  }

  // 폴더 내 자산 조회
  async findFavoriteAssets(favoriteId: number) {
    return this.favoriteAssetRepository.find({
      where: { favorite_id: favoriteId },
      order: { sort_order: 'ASC' },
    });
  }

  // 폴더 내 자산 중복 조회
  async findFavoriteAsset(
    favoriteId: number,
    assetType: string,
    infoId: number,
  ) {
    return this.favoriteAssetRepository.findOne({
      where: {
        favorite_id: favoriteId,
        asset_type: assetType,
        info_id: infoId,
      },
    });
  }

  // 정렬 순서 최대값 조회
  async findMaxSortOrder(favoriteId: number) {
    return this.favoriteAssetRepository.findOne({
      where: { favorite_id: favoriteId },
      order: { sort_order: 'DESC' },
    });
  }

  // 자산 추가 및 정렬 순서 업데이트
  async createFavoriteAsset(
    favoriteId: number,
    assetType: string,
    infoId: number,
    sortOrder: number,
  ) {
    const newAsset = this.favoriteAssetRepository.create({
      favorite_id: favoriteId,
      asset_type: assetType,
      info_id: infoId,
      sort_order: sortOrder,
    });

    return this.favoriteAssetRepository.save(newAsset);
  }

  async updateSortOrder(favoriteId: number, deletedSortOrder: number) {
    await this.favoriteAssetRepository
      .createQueryBuilder()
      .update(FavoriteAsset)
      .set({
        sort_order: () => 'sort_order - 1',
      })
      .where('favorite_id = :favoriteId AND sort_order > :deletedSortOrder', {
        favoriteId,
        deletedSortOrder,
      })
      .execute();
  }

  async executeDeleteFavoriteAssetTransaction(
    userId: string,
    favoriteId: number,
    favoriteAssetId: number,
  ) {
    return this.dataSource.transaction(async (entityManager) => {
      // 1. 폴더 존재 및 소유자 여부 조회
      const favoriteFolder = await entityManager.findOne(Favorite, {
        where: { id: favoriteId, user_id: userId },
      });

      if (!favoriteFolder) {
        throw new Error('Favorite folder not found');
      }

      // 2. 자산 존재 여부 조회
      const favoriteAsset = await entityManager.findOne(FavoriteAsset, {
        where: { favorite_id: favoriteId, id: favoriteAssetId },
      });

      if (!favoriteAsset) {
        throw new Error('Favorite asset not found');
      }

      // 3. 자산 삭제
      const deletedAsset = await entityManager.delete(FavoriteAsset, {
        favorite_id: favoriteId,
        id: favoriteAssetId,
      });

      if (!deletedAsset.affected || deletedAsset.affected === 0) {
        throw new Error('Failed to delete asset from favorite folder');
      }

      // 4. 자산 삭제 후 정렬 순서 업데이트
      await entityManager
        .createQueryBuilder()
        .update(FavoriteAsset)
        .set({
          sort_order: () => 'sort_order - 1',
        })
        .where('favorite_id = :favoriteId AND sort_order > :deletedSortOrder', {
          favoriteId,
          deletedSortOrder: favoriteAsset.sort_order,
        })
        .execute();

      // 성공 시 응답
      return {
        success: true,
        message: 'Favorite asset deleted successfully.',
      };
    });
  }
}
