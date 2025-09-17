import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AssetHistoryRepository } from './asset-history.repository';
import {
  CreateAssetHistoryRequestDto,
  GetAssetHistoryQueryDto,
  UpdateAssetHistoryRequestDto,
} from '../dto';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';
import { PortfolioValidator } from '../lib/portfolio-validator';
import { DataSource } from 'typeorm';
import { UserAsset } from 'src/database/entities/portfolio/user-asset.entity';
import { AssetHistory } from 'src/database/entities/portfolio/asset-history.entity';
import { CashTransaction } from 'src/database/entities/account/cash-transaction.entity';

@Injectable()
export class AssetHistoryService {
  constructor(
    private readonly assetHistoryRepository: AssetHistoryRepository,
    private readonly portfolioValidator: PortfolioValidator,
    private readonly dataSource: DataSource,
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

  async deleteAssetHistory(
    portfolioId: number,
    categoryId: number,
    assetId: number,
    historyId: number,
    userId: string,
  ) {
    try {
      // 1. 포트폴리오, 카테고리, 자산 소유권 검증
      await this.portfolioValidator.validatePortfolioAndFindUserAsset(
        portfolioId,
        categoryId,
        assetId,
        userId,
      );

      // 2. 거래내역 존재 여부 확인
      const assetHistory =
        await this.assetHistoryRepository.getAssetHistory(historyId);

      if (!assetHistory) {
        throw new HttpException(
          ErrorResponseUtil.notFound('Asset history not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      return await this.dataSource.transaction(async (manager) => {
        // 3. 거래내역 삭제
        const result = await this.assetHistoryRepository.deleteAssetHistory(
          historyId,
          manager,
        );

        // 3-1. 현금 자동 연동(T8): 연동된 예수금 거래 롤백 및 삭제
        const linked = await manager.findOne(CashTransaction, {
          where: { asset_history_id: historyId },
        });
        if (linked) {
          const amt = Number(linked.amount);
          if (linked.type === 'buy') {
            await manager.query(
              `UPDATE portfolio_institution_balance
               SET balance = balance + $4, updated_at = NOW()
               WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3`,
              [
                linked.portfolio_id,
                linked.institution_id,
                linked.currency_code_id,
                amt,
              ],
            );
          } else if (linked.type === 'sell') {
            const rows = await manager.query(
              `UPDATE portfolio_institution_balance
               SET balance = balance - $4, updated_at = NOW()
               WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
                 AND balance >= $4
               RETURNING id`,
              [
                linked.portfolio_id,
                linked.institution_id,
                linked.currency_code_id,
                amt,
              ],
            );
            if (!rows?.length) {
              throw new Error('Insufficient balance');
            }
          }
          await manager.delete(CashTransaction, { id: linked.id });
        }

        // 4. 수량 업데이트 로직
        await this.assetHistoryRepository.updateUserAssetQuantityForDelete(
          assetHistory.user_asset_id, // userAssetId
          assetHistory.asset_history_type_id, // 거래 타입
          Number(assetHistory.quantity), // 삭제할 수량
          manager, // 트랜잭션 manager
        );

        // 5. UserAsset 수량이 0 AND History가 존재하지 않으면 UserAsset 삭제
        const userAsset = await manager.findOne(UserAsset, {
          where: { id: assetHistory.user_asset_id },
          relations: ['asset_histories'],
        });
        if (Number(userAsset?.quantity) === 0) {
          const remainingHistories = await manager.count(AssetHistory, {
            where: { user_asset_id: userAsset?.id },
          });
          if (remainingHistories === 0) {
            await manager.delete(UserAsset, { id: userAsset?.id });
          }
        }

        return {
          success: true,
          message: 'Asset history deleted successfully.',
          data: {
            asset_history_id: historyId,
            deleted_at: new Date().toISOString(),
          },
        };
      });
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
        ErrorResponseUtil.internalServerError('Failed to delete asset history'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAssetHistory(
    portfolioId: number,
    categoryId: number,
    assetId: number,
    historyId: number,
    updateAssetHistoryRequestDto: UpdateAssetHistoryRequestDto,
    userId: string,
  ) {
    try {
      // 1) 포트폴리오, 카테고리, 자산 소유권 검증 및 UserAsset 확인
      const { userAsset } =
        await this.portfolioValidator.validatePortfolioAndFindUserAsset(
          portfolioId,
          categoryId,
          assetId,
          userId,
        );

      // 2) 거래내역 존재 여부 확인 및 소유권 검증
      const existing =
        await this.assetHistoryRepository.getAssetHistory(historyId);
      if (!existing) {
        throw new HttpException(
          ErrorResponseUtil.notFound('Asset history not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (userAsset && existing.user_asset_id !== userAsset.id) {
        // 경로상의 자산/카테고리와 거래내역의 소유관계가 다르면 Not Found 처리
        throw new HttpException(
          ErrorResponseUtil.notFound('Asset history not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      // 3) 트랜잭션으로 업데이트 (수량 조정 + 거래내역 업데이트)
      const data = await this.assetHistoryRepository.updateAssetHistory(
        historyId,
        updateAssetHistoryRequestDto,
      );

      return {
        success: true,
        message: 'Asset history updated successfully.',
        data,
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

      if (
        error.message === 'Asset history not found' ||
        error.message === 'Quantity cannot be negative'
      ) {
        throw new HttpException(
          ErrorResponseUtil.badRequest(error.message),
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
