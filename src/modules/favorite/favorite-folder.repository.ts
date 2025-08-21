import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from 'src/database/entities/favorite/favorite.entity';
import { Repository, Transaction } from 'typeorm';

@Injectable()
export class FavoriteFolderRepository {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
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
}
