import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AssetHistoryRepository } from './asset-history.repository';
import { CreateAssetHistoryRequestDto, GetAssetHistoryQueryDto } from '../dto';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';
import { PortfolioValidator } from '../lib/portfolio-validator';

@Injectable()
export class AssetHistoryService {
  constructor(
    private readonly assetHistoryRepository: AssetHistoryRepository,
    private readonly portfolioValidator: PortfolioValidator,
  ) {}

  async getAssetHistories(
    portfolioId: number,
    categoryId: number,
    assetId: number,
    userId: string,
    queryDto: GetAssetHistoryQueryDto,
  ) {
    try {
      // 1. 포트폴리오, 카테고리, 자산 소유권 검증
      await this.portfolioValidator.validatePortfolioAndFindUserAsset(
        portfolioId,
        categoryId,
        assetId,
        userId,
      );

      // 2. 거래내역 조회
      const result = await this.assetHistoryRepository.getAssetHistories(
        portfolioId,
        categoryId,
        assetId,
        userId,
        queryDto,
      );

      return {
        success: true,
        message: 'Transaction histories retrieved successfully.',
        data: result,
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

      throw new HttpException(
        ErrorResponseUtil.internalServerError(
          'Failed to retrieve asset histories',
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createAssetHistory(
    portfolioId: number,
    categoryId: number,
    assetId: number,
    createAssetHistoryRequestDto: CreateAssetHistoryRequestDto,
    userId: string,
  ) {
    try {
      // 1. 포트폴리오, 카테고리 소유권 검증
      // 2. 자산 정보 유효성 검증
      // 3. UserAsset에 자산 존재여부 확인
      // 4. UserAsset 존재 여부 확인
      const validationResult =
        await this.portfolioValidator.validatePortfolioAndFindUserAsset(
          portfolioId,
          categoryId,
          assetId,
          userId,
        );

      const { userAsset } = validationResult;

      if (userAsset) {
        // 4-1. 거래내역 생성
        const result = await this.assetHistoryRepository.createAssetHistory(
          createAssetHistoryRequestDto,
          userAsset.id,
        );

        return {
          success: true,
          message: 'Asset history created successfully.',
          data: result,
        };
      } else {
        // 4-2. UserAsset 생성 및 거래내역 생성
        const result =
          await this.assetHistoryRepository.createUserAssetAndAssetHistory(
            categoryId,
            assetId,
            createAssetHistoryRequestDto,
            userId,
          );

        return {
          success: true,
          message: 'UserAsset and asset history created successfully.',
          data: result,
        };
      }

      // 5. 수량 업데이트 로직
      // 6. 총 거래금액 계산
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
