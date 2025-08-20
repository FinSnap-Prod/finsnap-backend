import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from 'src/database/entities/favorite/favorite.entity';
import { Repository } from 'typeorm';

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
}
