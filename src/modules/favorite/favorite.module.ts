import { Module } from '@nestjs/common';
import { FavoriteFolderController } from './favorite-folder.controller';
import { FavoriteAssetController } from './favorite-asset.controller';
import { FavoriteAssetService } from './favorite-asset.service';
import { FavoriteFolderService } from './favorite-folder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from 'src/database/entities/favorite/favorite.entity';
import { FavoriteAsset } from 'src/database/entities/favorite/favorite-asset.entity';
import { FavoriteFolderRepository } from './favorite-folder.repository';
import { FavoriteAssetRepository } from './favorite-asset.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, FavoriteAsset])],
  controllers: [FavoriteFolderController, FavoriteAssetController],
  providers: [
    FavoriteFolderService,
    FavoriteAssetService,
    FavoriteFolderRepository,
    FavoriteAssetRepository,
  ],
  exports: [FavoriteFolderService, FavoriteAssetService],
})
export class FavoriteModule {}
