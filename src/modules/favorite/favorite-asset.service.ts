import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FavoriteAssetRepository } from './favorite-asset.repository';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';
import { StockRepository } from '../investment/stock/stock.repository';
import { EtfRepository } from '../investment/etf/etf.repository';
import { CryptoRepository } from '../investment/crypto/crypto.repository';

@Injectable()
export class FavoriteAssetService {
  constructor(
    private readonly favoriteRepository: FavoriteAssetRepository,
    private readonly stockRepository: StockRepository,
    private readonly etfRepository: EtfRepository,
    private readonly cryptoRepository: CryptoRepository,
  ) {}

  async getFavoriteAssets(
    userId: string,
    favorite_id: string,
    sortBy: string,
    order: string,
  ) {
    // 1. 폴더 존재 및 소유자 여부 조회
    const favoriteFolder =
      await this.favoriteRepository.findFavoriteFolderWithUserId(
        Number(favorite_id),
        userId,
      );

    if (!favoriteFolder) {
      throw new HttpException(
        ErrorResponseUtil.badRequest('Favorite folder not found'),
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. favorite_asset 조회
    const favoriteAssets = await this.favoriteRepository.findFavoriteAssets(
      Number(favorite_id),
    );

    if (favoriteAssets.length === 0) {
      return {
        success: true,
        message: 'Favorite folder is empty',
        data: [],
      };
    }

    // 3. 자산별 상세 정보 조회
    const assetWithInfo = await Promise.all(
      favoriteAssets.map(async (asset) => {
        let info;

        switch (asset.asset_type) {
          case 'stock':
            info = await this.stockRepository.findStockInfo(asset.info_id);
            break;
          case 'etf':
            info = await this.etfRepository.findEtfInfo(asset.info_id);
            break;
          case 'crypto':
            info = await this.cryptoRepository.findCryptoInfo(asset.info_id);
            break;
          default:
            info = null;
        }

        return {
          favorite_asset_id: asset.id,
          asset_type: asset.asset_type,
          info_id: asset.info_id,
          sort_order: asset.sort_order,
          info: {
            ticker: info.ticker,
            kor_name: info.kor_name,
            eng_name: info.eng_name,
            market: info.market,
            price: info.price,
            change_price: info.change_price,
            change_rate: info.change_rate,
          },
        };
      }),
    );

    // 4. 각 자산 정렬
    let sortedAssets = [...assetWithInfo];
    if (sortBy === 'name') {
      sortedAssets.sort((a, b) => {
        const getName = (asset) => {
          // 1순위: kor_name
          if (asset.info.kor_name) {
            return asset.info.kor_name.toLowerCase();
          }
          // 2순위: eng_name
          if (asset.info.eng_name) {
            return asset.info.eng_name.toLowerCase();
          }
          return '';
        };

        const nameA = getName(a);
        const nameB = getName(b);

        return order === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    } else if (sortBy === 'price') {
      sortedAssets.sort((a, b) => {
        const priceA = a.info.price || 0;
        const priceB = b.info.price || 0;
        return order === 'asc' ? priceA - priceB : priceB - priceA;
      });
    } else {
      sortedAssets.sort((a, b) => a.sort_order - b.sort_order);
    }

    return {
      success: true,
      message: 'Favorite assets retrieved successfully.',
      data: sortedAssets,
    };
  }
}
