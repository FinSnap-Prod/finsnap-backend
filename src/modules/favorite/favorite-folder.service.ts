import { Injectable } from '@nestjs/common';
import { FavoriteFolderRepository } from './favorite-folder.repository';

@Injectable()
export class FavoriteFolderService {
  constructor(private readonly favoriteRepository: FavoriteFolderRepository) {}

  async getFavoriteFolders(userId: string) {
    const favoriteFolders =
      await this.favoriteRepository.findFavoriteFolders(userId);

    if (favoriteFolders.length === 0) {
      return {
        success: true,
        message: 'Favorite folders not found',
        data: [],
      };
    }

    return {
      success: true,
      message: 'Favorite Folders retrieved successfully.',
      data: favoriteFolders.map((folder) => ({
        favorite_id: folder.id,
        name: folder.name,
        sort_order: folder.sort_order,
      })),
    };
  }
}
