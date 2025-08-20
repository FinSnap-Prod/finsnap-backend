import { Injectable } from '@nestjs/common';
import { FavoriteAssetRepository } from './favorite-asset.repository';

@Injectable()
export class FavoriteAssetService {
  constructor(private readonly favoriteRepository: FavoriteAssetRepository) {}
}
