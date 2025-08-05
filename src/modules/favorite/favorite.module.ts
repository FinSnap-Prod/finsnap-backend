import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteFolderController } from './favorite-folder.controller';
import { FavoriteAssetController } from './favorite-asset.controller';

@Module({
  controllers: [FavoriteFolderController, FavoriteAssetController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
