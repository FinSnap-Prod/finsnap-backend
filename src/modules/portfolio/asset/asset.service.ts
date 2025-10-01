import { Injectable } from '@nestjs/common';
import { AssetRepository } from './asset.repository';
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
  }
}
