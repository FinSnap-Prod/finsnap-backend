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
}
