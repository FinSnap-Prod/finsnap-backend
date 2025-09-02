import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AssetRepository } from './asset.repository';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';
import { PortfolioValidator } from '../lib/portfolio-validator';

@Injectable()
export class AssetService {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly portfolioValidator: PortfolioValidator,
  ) {}

  async deleteAsset(
    portfolioId: number,
    categoryId: number,
    assetId: number,
    userId: string,
  ) {
    try {
      const validationResult =
        await this.portfolioValidator.validatePortfolioAndFindUserAsset(
          portfolioId,
          categoryId,
          assetId,
          userId,
        );

      const { userAsset } = validationResult;

      if (!userAsset) {
        throw new Error('UserAsset not found');
      }

      await this.assetRepository.deleteAsset(userAsset.id);

      return {
        success: true,
        message: 'Asset deleted successfully',
        data: {
          asset_id: assetId,
          deleted_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error.message === 'Portfolio not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Category not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Category not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Asset not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Asset not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'UserAsset not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('UserAsset not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
