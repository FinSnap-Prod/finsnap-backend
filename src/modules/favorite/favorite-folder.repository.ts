import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from 'src/database/entities/favorite/favorite.entity';
import { DataSource, Repository } from 'typeorm';
import { FavoriteItemDto } from './dto';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

@Injectable()
export class FavoriteFolderRepository {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    private dataSource: DataSource,
  ) {}

  // 사용자의 관심종목 폴더 목록 조회
  async findFavoriteFolders(userId: string) {
    return this.favoriteRepository.find({
      where: { user_id: userId },
      order: { sort_order: 'ASC' },
    });
  }

  // 폴더 이름 중복 조회
  async findByFolderNameWithUserId(name: string, userId: string) {
    return this.favoriteRepository.findOne({
      where: { user_id: userId, name },
    });
  }

  // 폴더 정렬 순서 최대값 조회
  async findMaxSortOrder(userId: string) {
    const result = await this.favoriteRepository.findOne({
      where: { user_id: userId },
      order: { sort_order: 'DESC' },
    });

    if (!result) {
      return 0;
    }

    return result.sort_order;
  }

  // 폴더 생성
  async createFavoriteFolder(name: string, userId: string, sort_order: number) {
    const newFolder = this.favoriteRepository.create({
      user_id: userId,
      name,
      sort_order,
    });

    return this.favoriteRepository.save(newFolder);
  }

  // 폴더 ID 중복 조회
  async findByFolderIdWithUserId(favoriteId: number, userId: string) {
    return this.favoriteRepository.findOne({
      where: { id: favoriteId, user_id: userId },
    });
  }

  // 폴더 삭제
  async deleteFavoriteFolder(favoriteId: number) {
    return this.favoriteRepository.delete(favoriteId);
  }

  // 폴더 정렬 순서 조정
  async updateSortOrder(userId: string, deletedSortOrder) {
    await this.favoriteRepository
      .createQueryBuilder()
      .update(Favorite)
      .set({
        sort_order: () => 'sort_order -1',
      })
      .where('user_id = :userId AND sort_order > :deletedSortOrder', {
        userId,
        deletedSortOrder,
      })
      .execute();
  }

  // 폴더 이름 변경
  async updateFavoriteFolderName(favoriteId: number, name: string) {
    return this.favoriteRepository.update({ id: favoriteId }, { name });
  }

  // 폴더 정렬 순서 변경
  async updateFavoriteFolderSortOrder(favoriteId: number, sort_order: number) {
    return this.favoriteRepository.update({ id: favoriteId }, { sort_order });
  }

  async updateFavoriteFolderWithTransation(
    favorites: FavoriteItemDto[],
    userId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // 1. 폴더 조회 및 검증
      for (const favorite of favorites) {
        const existingFolder = await manager.findOne(Favorite, {
          where: { id: favorite.id, user_id: userId },
        });

        if (!existingFolder) {
          throw new HttpException(
            ErrorResponseUtil.badRequest('폴더를 찾을 수 없습니다.'),
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // 2. 임시로 sort_order를 큰 값으로 설정
      for (const favorite of favorites) {
        await manager.update(
          Favorite,
          { id: favorite.id },
          { sort_order: favorite.sort_order + 10000 },
        );
      }

      // 3. 실제 sort_order로 설정
      for (const favorite of favorites) {
        await manager.update(
          Favorite,
          { id: favorite.id },
          { sort_order: favorite.sort_order },
        );
      }

      // 4. 폴더 이름 변경
      for (const favorite of favorites) {
        await manager.update(
          Favorite,
          { id: favorite.id },
          { name: favorite.name },
        );
      }

      // 5. 수정된 폴더 조회
      return manager.find(Favorite, {
        where: { user_id: userId },
        order: { sort_order: 'ASC' },
      });
    });
  }
}
