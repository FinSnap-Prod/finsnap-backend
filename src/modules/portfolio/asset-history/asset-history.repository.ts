import { Injectable } from '@nestjs/common';
import { UserAsset } from 'src/database/entities/portfolio/user-asset.entity';
import { DataSource } from 'typeorm';
import { CreateAssetHistoryRequestDto } from '../dto';
import { AssetHistory } from 'src/database/entities/portfolio/asset-history.entity';

@Injectable()
export class AssetHistoryRepository {
  constructor(private dataSource: DataSource) {}

  async createAssetHistory(
    createAssetHistoryRequestDto: CreateAssetHistoryRequestDto,
    userAssetId: number,
    manager?: any, // 기존 트랜잭션의 manager를 받을 수 있도록
  ) {
    const { asset_history_type_id, price, quantity, memo, recorded_at } =
      createAssetHistoryRequestDto;

    // 트랜잭션 실행 함수
    const executeInTransaction = async (transactionManager: any) => {
      // 1. UserAsset 정보 조회 (institution_id, currency_code_id 등)
      const userAsset = await transactionManager.findOne(UserAsset, {
        where: { id: userAssetId },
        relations: ['category', 'asset'], // 관계 데이터도 함께 조회
      });

      if (!userAsset) {
        throw new Error('UserAsset not found');
      }

      // 2. AssetHistory 생성
      const assetHistory = await transactionManager.create(AssetHistory, {
        user_asset_id: userAssetId,
        recorded_at: new Date(recorded_at),
        asset_history_type_id,
        price: price.toString(),
        quantity: quantity.toString(),
        total_amount: (price * quantity).toString(),
        memo: memo || undefined,
        deleted: false,
      });

      await transactionManager.save(assetHistory);

      // 3. 매수/매도인 경우 수량 업데이트
      if (asset_history_type_id === 1 || asset_history_type_id === 2) {
        await this.updateUserAssetQuantity(
          userAssetId,
          asset_history_type_id,
          quantity,
          transactionManager, // 같은 트랜잭션의 manager 전달
        );
      }

      // 4. 필요한 모든 데이터를 포함하여 반환
      const responseData = {
        asset_id: userAsset.asset_id,
        category_id: userAsset.category_id,
        institution_id: userAsset.institution_id,
        currency_code_id: userAsset.currency_code_id,
        asset_history_type_id: assetHistory.asset_history_type_id,
        price: Number(assetHistory.price),
        quantity: Number(assetHistory.quantity),
        memo: assetHistory.memo,
        recorded_at: assetHistory.recorded_at,
        created_at: assetHistory.created_at,
        updated_at: assetHistory.updated_at,
      };

      return responseData;
    };

    // manager가 있으면 기존 트랜잭션 사용, 없으면 새 트랜잭션 생성
    if (manager) {
      return await executeInTransaction(manager);
    } else {
      return this.dataSource.transaction(executeInTransaction);
    }
  }

  // UserAsset 생성 후 거래내역 생성 함수 호출
  async createUserAssetAndAssetHistory(
    categoryId: number,
    assetId: number,
    createAssetHistoryRequestDto: CreateAssetHistoryRequestDto,
    userId: string,
  ) {
    const {
      institution_id,
      currency_code_id,
      asset_history_type_id,
      price,
      quantity,
      memo,
      recorded_at,
    } = createAssetHistoryRequestDto;

    return this.dataSource.transaction(async (manager) => {
      // 1. UserAsset 생성
      const userAsset = await manager.create(UserAsset, {
        category_id: categoryId,
        asset_id: assetId,
        institution_id,
        currency_code_id,
        avg_price: price.toString(),
        quantity: quantity.toString(),
        eval_amount: '0',
        profit_loss: '0',
        profit_rate: '0',
        memo: memo || undefined,
        deleted: false,
      });

      await manager.save(userAsset);

      // 2. 생성된 UserAsset 조회 (institution_id, currency_code_id 포함)
      const findUserAsset = await manager.findOne(UserAsset, {
        where: {
          category_id: categoryId,
          asset_id: assetId,
          institution_id,
          currency_code_id,
        },
      });

      if (!findUserAsset) {
        throw new Error('UserAsset not found');
      }

      // 3. 거래내역 생성
      const assetHistory = await this.createAssetHistory(
        createAssetHistoryRequestDto,
        findUserAsset.id,
        manager, // 기존 트랜잭션의 manager 전달
      );

      // 4. 동일한 구조로 반환
      const responseData = {
        asset_id: findUserAsset.asset_id,
        category_id: findUserAsset.category_id,
        institution_id: findUserAsset.institution_id,
        currency_code_id: findUserAsset.currency_code_id,
        asset_history_type_id: assetHistory.asset_history_type_id,
        price: Number(assetHistory.price),
        quantity: Number(assetHistory.quantity),
        memo: assetHistory.memo,
        recorded_at: assetHistory.recorded_at,
        created_at: assetHistory.created_at,
        updated_at: assetHistory.updated_at,
      };

      return responseData;
    });
  }

  // UserAsset 수량 업데이트
  async updateUserAssetQuantity(
    userAssetId: number,
    assetHistoryTypeId: number,
    quantity: number,
    manager?: any, // 기존 트랜잭션의 manager를 받을 수 있도록
  ) {
    // 트랜잭션 실행 함수
    const executeInTransaction = async (transactionManager: any) => {
      const userAsset = await transactionManager.findOne(UserAsset, {
        where: { id: userAssetId },
      });

      if (!userAsset) {
        throw new Error('UserAsset not found');
      }

      const currentQuantity = Number(userAsset.quantity);
      let newQuantity: number;

      if (assetHistoryTypeId === 1) {
        newQuantity = currentQuantity + quantity;
      } else if (assetHistoryTypeId === 2) {
        newQuantity = currentQuantity - quantity;

        if (newQuantity < 0) {
          throw new Error('Quantity cannot be negative');
        }
      } else {
        return;
      }

      await transactionManager.update(UserAsset, userAssetId, {
        quantity: newQuantity.toString(),
      });

      return newQuantity;
    };

    // manager가 있으면 기존 트랜잭션 사용, 없으면 새 트랜잭션 생성
    if (manager) {
      return await executeInTransaction(manager);
    } else {
      return this.dataSource.transaction(executeInTransaction);
    }
  }
}
