import { Injectable } from '@nestjs/common';
import { UserAsset } from 'src/database/entities/portfolio/user-asset.entity';
import { DataSource } from 'typeorm';
import {
  CreateAssetHistoryRequestDto,
  GetAssetHistoryQueryDto,
  UpdateAssetHistoryRequestDto,
} from '../dto';
import { AssetHistory } from 'src/database/entities/portfolio/asset-history.entity';
import { StockInfo } from 'src/database/entities/stock/stock-info.entity';
import { EtfInfo } from 'src/database/entities/etf/etf-info.entity';
import { CryptoInfo } from 'src/database/entities/crypto/crypto-info.entity';

@Injectable()
export class AssetHistoryRepository {
  constructor(private dataSource: DataSource) {}

  async getAssetHistories(
    portfolioId: number,
    categoryId: number,
    assetId: number,
    userId: string,
    queryDto: GetAssetHistoryQueryDto,
  ) {
    const {
      order = 'desc',
      sortBy = 'recorded_at',
      page = '1',
      limit = '20',
      type,
    } = queryDto;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    return this.dataSource.transaction(async (manager) => {
      // 1. UserAsset 조회 (관계 데이터 포함)
      const userAsset = await manager.findOne(UserAsset, {
        where: {
          asset_id: assetId,
          category_id: categoryId,
        },
        relations: ['category', 'asset', 'institution', 'currency_code'],
      });

      if (!userAsset) {
        throw new Error('UserAsset not found');
      }

      // 2. 총 거래내역 수 조회
      const totalItems = await manager.count(AssetHistory, {
        where: {
          user_asset_id: userAsset.id,
          ...(type ? { asset_history_type_id: this.getTypeId(type) } : {}),
        },
      });

      // 3. 거래내역 조회 (페이지네이션 적용)
      const assetHistories = await manager.find(AssetHistory, {
        where: {
          user_asset_id: userAsset.id,
          ...(type ? { asset_history_type_id: this.getTypeId(type) } : {}),
        },
        relations: ['asset_history_type'],
        order: {
          [sortBy]: order.toUpperCase() as 'ASC' | 'DESC',
        },
        skip, // 거래내역 조회 시작 인덱스
        take: limitNumber, // 페이지당 거래내역 수
      });

      // 4. 페이지네이션 정보 계산
      const totalPages = Math.ceil(totalItems / limitNumber);

      // 5. AssetInfo에서 실제 이름 조회 필요
      let assetName = '';
      switch (userAsset.asset.asset_type_id) {
        case 1:
          const stockInfo = await manager.findOne(StockInfo, {
            where: {
              id: userAsset.asset.asset_info_id,
            },
          });
          assetName = stockInfo?.kor_name || stockInfo?.eng_name || '';
          break;
        case 2:
          const etfInfo = await manager.findOne(EtfInfo, {
            where: {
              id: userAsset.asset.asset_info_id,
            },
          });
          assetName = etfInfo?.kor_name || etfInfo?.eng_name || '';
          break;
        case 3:
          const cryptoInfo = await manager.findOne(CryptoInfo, {
            where: {
              id: userAsset.asset.asset_info_id,
            },
          });
          assetName = cryptoInfo?.kor_name || cryptoInfo?.eng_name || '';
          break;
      }

      // 6. 요약 정보 계산
      const summary = await this.getAssetHistorySummary(userAsset.id, manager);

      // 7. 응답 데이터 구성
      const histories = assetHistories.map((history) => ({
        asset_history_id: history.id,
        type: history.asset_history_type?.display_name || 'unknown',
        quantity: Number(history.quantity),
        price: Number(history.price),
        total: Number(history.total_amount),
        recorded_at: history.recorded_at.toISOString().split('T')[0], // YYYY-MM-DD 형식
        memo: history.memo,
      }));

      return {
        asset_info: {
          asset_id: assetId,
          asset_name: assetName || '',
          asset_type: this.getAssetTypeName(userAsset.asset.asset_type_id),
        },
        portfolio_info: {
          portfolio_id: portfolioId,
          category_id: categoryId,
          category_name: userAsset.category?.name || '',
          institution_id: userAsset.institution_id,
          institution_name: userAsset.institution?.display_name || '',
          currency_code: userAsset.currency_code?.currency_code || 'KRW',
        },
        summary,
        histories,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: limitNumber,
        },
      };
    });
  }

  private getTypeId(type: string): number {
    const typeMap = {
      buy: 1,
      sell: 2,
      deposit: 3,
      withdraw: 4,
      exchange: 5,
    };
    return typeMap[type] || null;
  }

  private getAssetTypeName(assetTypeId: number): string {
    const typeMap = {
      1: 'stock',
      2: 'etf',
      3: 'crypto',
    };
    return typeMap[assetTypeId] || 'unknown';
  }

  private getTypeNameById(typeId: number): string {
    const map: Record<number, string> = {
      1: 'buy',
      2: 'sell',
      3: 'deposit',
      4: 'withdraw',
      5: 'exchange',
    };
    return map[typeId] || 'unknown';
  }

  private async getAssetHistorySummary(userAssetId: number, manager: any) {
    // 1. 모든 통계를 한 번에 조회
    const stats = await manager
      .createQueryBuilder(AssetHistory, 'ah')
      .select('COUNT(*)', 'total_transactions')
      .addSelect(
        'SUM(CASE WHEN ah.asset_history_type_id = 1 THEN ah.quantity ELSE 0 END)',
        'total_buy_quantity',
      )
      .addSelect(
        'SUM(CASE WHEN ah.asset_history_type_id = 2 THEN ah.quantity ELSE 0 END)',
        'total_sell_quantity',
      )
      .addSelect(
        'SUM(CASE WHEN ah.asset_history_type_id = 1 THEN ah.total_amount ELSE 0 END)',
        'total_buy_amount',
      )
      .addSelect(
        'SUM(CASE WHEN ah.asset_history_type_id = 2 THEN ah.total_amount ELSE 0 END)',
        'total_sell_amount',
      )
      .where('ah.user_asset_id = :userAssetId', { userAssetId })
      .getRawOne();

    // 2. UserAsset 정보 조회
    const userAsset = await manager.findOne(UserAsset, {
      where: { id: userAssetId },
      select: ['quantity', 'avg_price'],
    });

    return {
      total_transactions: Number(stats.total_transactions),
      current_quantity: Number(userAsset.quantity),
      avg_price: Number(userAsset.avg_price),
      total_buy_quantity: Number(stats.total_buy_quantity || 0),
      total_sell_quantity: Number(stats.total_sell_quantity || 0),
      total_buy_amount: Number(stats.total_buy_amount || 0),
      total_sell_amount: Number(stats.total_sell_amount || 0),
    };
  }

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
        quantity: '0',
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

  async getAssetHistory(historyId: number) {
    return await this.dataSource.manager.findOne(AssetHistory, {
      where: { id: historyId },
    });
  }

  async deleteAssetHistory(historyId: number, manager: any) {
    return await manager.delete(AssetHistory, { id: historyId });
  }

  async updateAssetHistory(
    historyId: number,
    dto: UpdateAssetHistoryRequestDto,
  ) {
    const {
      asset_history_type_id: newTypeId,
      price: newPrice,
      quantity: newQty,
      memo: newMemo,
      recorded_at: newRecordedAt,
      institution_id,
      currency_code_id,
    } = dto;

    return this.dataSource.transaction(async (manager) => {
      // 1) 기존 거래내역 + 관련 UserAsset 로드
      const existing = await manager.findOne(AssetHistory, {
        where: { id: historyId },
      });

      if (!existing) {
        throw new Error('Asset history not found');
      }

      const userAsset = await manager.findOne(UserAsset, {
        where: { id: existing.user_asset_id },
        relations: [
          'category',
          'category.portfolio',
          'asset',
          'institution',
          'currency_code',
        ],
      });

      if (!userAsset) {
        throw new Error('UserAsset not found');
      }

      // 2) 수량 변화량 계산 (buy=+qty, sell=-qty; 기타 타입 0)
      const oldTypeId = existing.asset_history_type_id;
      const oldQty = Number(existing.quantity);
      const currentQty = Number(userAsset.quantity);

      const effect = (typeId: number, qty: number) => {
        if (typeId === 1) return qty; // buy
        if (typeId === 2) return -qty; // sell
        return 0; // deposit/withdraw/exchange는 수량 영향 없음
      };

      /**
       * 기존 매수 (1, 10)
       * 수정 매도 (2, 20)
       * effect(2, 20) - effect(1, 10) = -10
       * nextUserAssetQty = currentQty + delta = 0 - 10 = -10
       * -10 < 0 -> throw Error
       *
       * 기존 매도 (2, 20)
       * 수정 매수 (1, 10)
       * effect(1, 10) - effect(2, 20) = 10
       * nextUserAssetQty = currentQty + delta = 0 + 10 = 10
       * 10 > 0 -> update UserAsset
       */
      const delta = effect(newTypeId, newQty) - effect(oldTypeId, oldQty);
      const nextUserAssetQty = currentQty + delta;

      if (nextUserAssetQty < 0) {
        throw new Error('Quantity cannot be negative');
      }

      // 3) UserAsset 업데이트 (수량, 기관/통화 변경)
      await manager.update(UserAsset, userAsset.id, {
        quantity: nextUserAssetQty.toString(),
        institution_id: institution_id ?? userAsset.institution_id,
        currency_code_id: currency_code_id ?? userAsset.currency_code_id,
        // TODO: avg_price 재계산은 추후 공통 함수로 처리 예정
      });

      // 4) 거래내역 업데이트
      const updatedTotal = (newPrice * newQty).toString();
      await manager.update(AssetHistory, existing.id, {
        asset_history_type_id: newTypeId,
        price: newPrice.toString(),
        quantity: newQty.toString(),
        total_amount: updatedTotal,
        recorded_at: new Date(newRecordedAt),
        memo: newMemo ?? undefined,
      });

      // 5) 응답 구성에 필요한 이름/타입 문자열 준비
      // 자산 이름 조회
      let assetName = '';
      switch (userAsset.asset.asset_type_id) {
        case 1: {
          const stockInfo = await manager.findOne(StockInfo, {
            where: { id: userAsset.asset.asset_info_id },
          });
          assetName = stockInfo?.kor_name || stockInfo?.eng_name || '';
          break;
        }
        case 2: {
          const etfInfo = await manager.findOne(EtfInfo, {
            where: { id: userAsset.asset.asset_info_id },
          });
          assetName = etfInfo?.kor_name || etfInfo?.eng_name || '';
          break;
        }
        case 3: {
          const cryptoInfo = await manager.findOne(CryptoInfo, {
            where: { id: userAsset.asset.asset_info_id },
          });
          assetName = cryptoInfo?.kor_name || cryptoInfo?.eng_name || '';
          break;
        }
        default:
          assetName = '';
      }

      const typeName = this.getTypeNameById(newTypeId);

      // 6) 응답 객체 구성
      return {
        asset_info: {
          asset_id: userAsset.asset_id,
          asset_name: assetName,
          asset_type: this.getAssetTypeName(userAsset.asset.asset_type_id),
        },
        portfolio_info: {
          portfolio_id: userAsset.category.portfolio_id,
          portfolio_name: userAsset.category.portfolio?.name || '',
        },
        category_info: {
          category_id: userAsset.category_id,
          category_name: userAsset.category?.name || '',
        },
        institution_info: {
          institution_id: institution_id ?? userAsset.institution_id,
          institution_name: userAsset.institution?.display_name || '',
        },
        currency_info: {
          currency_code_id: currency_code_id ?? userAsset.currency_code_id,
          currency_code: userAsset.currency_code?.currency_code || 'KRW',
        },
        updated_history: {
          asset_history_id: existing.id,
          asset_history_type_id: newTypeId,
          type_name: typeName,
          quantity: newQty,
          price: newPrice,
          total_amount: Number(updatedTotal),
          recorded_at: new Date(newRecordedAt).toISOString(),
          memo: newMemo ?? null,
          updated_at: new Date().toISOString(),
        },
      };
    });
  }

  async updateUserAssetQuantityForDelete(
    userAssetId: number,
    assetHistoryTypeId: number,
    quantity: number,
    manager: any,
  ) {
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
        // 매수 거래 삭제 -> 수량 차감
        newQuantity = currentQuantity - quantity;
      } else if (assetHistoryTypeId === 2) {
        // 매도 거래 삭제 -> 수량 증가
        newQuantity = currentQuantity + quantity;

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

    if (manager) {
      return await executeInTransaction(manager); // 기존 트랜잭션 사용
    } else {
      return this.dataSource.transaction(executeInTransaction); // 새 트랜잭션 생성
    }
  }
}
