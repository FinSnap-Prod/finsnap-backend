import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FavoriteFolderRepository } from './favorite-folder.repository';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

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

  async createFavoriteFolder(name: string, userId: string) {
    //1. 폴더명 중복 조회
    const existingFolder =
      await this.favoriteRepository.findByFolderNameWithUserId(name, userId);

    if (existingFolder) {
      throw new HttpException(
        ErrorResponseUtil.badRequest('폴더 이름이 중복됩니다.'),
        HttpStatus.BAD_REQUEST,
      );
    }

    //2-1. 폴더 정렬 순서 최대값 조회
    const maxSortOrder = await this.favoriteRepository.findMaxSortOrder(userId);
    const newSortOrder = maxSortOrder ? maxSortOrder + 1 : 1;

    //2-2. 새로운 폴더 생성
    await this.favoriteRepository.createFavoriteFolder(
      name,
      userId,
      newSortOrder,
    );

    //3. 생성된 폴더 조회
    const createdFolder =
      await this.favoriteRepository.findByFolderNameWithUserId(name, userId);

    if (!createdFolder) {
      throw new HttpException(
        ErrorResponseUtil.badRequest('폴더 생성에 실패했습니다.'),
        HttpStatus.BAD_REQUEST,
      );
    }

    //4. 생성된 폴더 리턴
    return {
      success: true,
      message: 'Favorite Folder created successfully.',
      data: {
        favorite_id: createdFolder.id,
        name: createdFolder.name,
        sort_order: createdFolder.sort_order,
      },
    };
  }

  async deleteFavoriteFolder(favorite_id: string, userId: string) {
    const favoriteId = Number(favorite_id);

    //1. 폴더 조회
    const existingFolder =
      await this.favoriteRepository.findByFolderIdWithUserId(
        favoriteId,
        userId,
      );

    if (!existingFolder) {
      throw new HttpException(
        ErrorResponseUtil.badRequest('폴더를 찾을 수 없습니다.'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const deletedSortOrder = existingFolder.sort_order;

    //2-1. 폴더 삭제
    await this.favoriteRepository.deleteFavoriteFolder(favoriteId);

    //2-2. 폴더 삭제 후 정렬 순서 조정
    await this.favoriteRepository.updateSortOrder(userId, deletedSortOrder);

    //3. 리턴
    return {
      success: true,
      message: 'Favorite Folder deleted successfully.',
    };
  }
}
