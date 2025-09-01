import { Injectable } from '@nestjs/common';
import { Asset } from 'src/database/entities/asset/asset.entity';
import { Category } from 'src/database/entities/portfolio/category.entity';
import { Portfolio } from 'src/database/entities/portfolio/portfolio.entity';
import { UserAsset } from 'src/database/entities/portfolio/user-asset.entity';
import { DataSource } from 'typeorm';
import { CreateAssetHistoryRequestDto } from '../dto';
import { AssetHistory } from 'src/database/entities/portfolio/asset-history.entity';

@Injectable()
export class AssetHistoryRepository {
  constructor(private dataSource: DataSource) {}

  async validatePortfolioAndFindUserAsset(
    portfolioId: number,
    categoryId: number,
    assetId: number,
    institutionId: number,
    currencyCodeId: number,
    userId: string,
  ) {
    console.log('🔍 === validatePortfolioAndFindUserAsset START ===');
    console.log('📊 Input Parameters:');
    console.log('  portfolioId:', portfolioId, '(', typeof portfolioId, ')');
    console.log('  categoryId:', categoryId, '(', typeof categoryId, ')');
    console.log('  assetId:', assetId, '(', typeof assetId, ')');
    console.log(
      '  institutionId:',
      institutionId,
      '(',
      typeof institutionId,
      ')',
    );
    console.log(
      '  currencyCodeId:',
      currencyCodeId,
      '(',
      typeof currencyCodeId,
      ')',
    );
    console.log('  userId:', userId, '(', typeof userId, ')');

    return this.dataSource.transaction(async (manager) => {
      // 1. 포트폴리오 소유권 검증
      console.log('🔍 1. Checking Portfolio ownership...');
      const portfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
      });

      console.log('�� Found Portfolio:', portfolio);

      if (!portfolio) {
        console.log('❌ Portfolio not found!');
        throw new Error('Portfolio not found');
      }

      // 2. 카테고리 소유권 검증
      console.log('🔍 2. Checking Category ownership...');
      const category = await manager.findOne(Category, {
        where: { id: categoryId, portfolio_id: portfolioId },
      });

      console.log('📊 Found Category:', category);

      if (!category) {
        console.log('❌ Category not found!');
        throw new Error('Category not found');
      }

      // 3. 자산 존재 여부
      console.log('🔍 3. Checking Asset existence...');
      console.log('🔍 Searching Asset with ID:', assetId);

      // Asset 테이블의 전체 개수 확인
      const assetCount = await manager.count(Asset);
      console.log('📊 Total Asset count:', assetCount);

      // Asset ID 범위 확인 - 간단한 버전
      if (assetCount > 0) {
        const allAssets = await manager.find(Asset, {
          select: ['id'],
          order: { id: 'ASC' },
        });

        if (allAssets.length > 0) {
          const minAssetId = allAssets[0].id;
          const maxAssetId = allAssets[allAssets.length - 1].id;
          console.log('📊 Asset ID range:', minAssetId, '~', maxAssetId);

          // Asset ID가 범위 내에 있는지 확인
          if (assetId < minAssetId || assetId > maxAssetId) {
            console.log('❌ Asset ID out of range!');
            console.log('   Requested ID:', assetId);
            console.log('   Available range:', minAssetId, '~', maxAssetId);
          }
        }
      } else {
        console.log('�� No assets found in database');
      }

      const asset = await manager.findOne(Asset, {
        where: { id: assetId },
      });

      console.log('📊 Found Asset:', asset);

      if (!asset) {
        console.log('❌ Asset not found!');
        console.log('   Requested Asset ID:', assetId);

        if (assetCount > 0) {
          console.log('   Available Asset IDs (first 10):');
          const sampleAssets = await manager.find(Asset, {
            select: ['id'],
            take: 10,
            order: { id: 'ASC' },
          });
          console.log(
            '   Sample Asset IDs:',
            sampleAssets.map((a) => a.id),
          );
        }

        throw new Error('Asset not found');
      }

      // 4. UserAsset 존재 여부
      console.log('🔍 4. Checking UserAsset existence...');
      console.log('🔍 Searching UserAsset with criteria:');
      console.log('   asset_id:', assetId);
      console.log('   category_id:', categoryId);
      console.log('   institution_id:', institutionId);
      console.log('   currency_code_id:', currencyCodeId);

      const userAsset = await manager.findOne(UserAsset, {
        where: {
          asset_id: assetId,
          category_id: categoryId,
          institution_id: institutionId,
          currency_code_id: currencyCodeId,
        },
      });

      console.log('�� Found UserAsset:', userAsset);

      // UserAsset이 없는 경우, 해당 카테고리에 다른 UserAsset이 있는지 확인
      if (!userAsset) {
        console.log(
          '🔍 4-1. No UserAsset found, checking other UserAssets in same category...',
        );
        const otherUserAssets = await manager.find(UserAsset, {
          where: { category_id: categoryId },
          select: ['id', 'asset_id', 'institution_id', 'currency_code_id'],
        });
        console.log('📊 Other UserAssets in category:', otherUserAssets);
      }

      console.log('🔍 === validatePortfolioAndFindUserAsset END ===');

      return {
        portfolio,
        category,
        asset,
        userAsset,
      };
    });
  }

  async createAssetHistory(
    createAssetHistoryRequestDto: CreateAssetHistoryRequestDto,
    userAssetId: number,
    manager?: any, // 기존 트랜잭션의 manager를 받을 수 있도록
  ) {
    console.log('🔍 === createAssetHistory START ===');
    console.log('📊 Input Parameters:');
    console.log('  userAssetId:', userAssetId, '(', typeof userAssetId, ')');
    console.log('  DTO:', createAssetHistoryRequestDto);

    const {
      institution_id,
      currency_code_id,
      asset_history_type_id,
      price,
      quantity,
      memo,
      recorded_at,
    } = createAssetHistoryRequestDto;

    // 트랜잭션 실행 함수
    const executeInTransaction = async (transactionManager: any) => {
      // 1. UserAsset 정보 조회 (institution_id, currency_code_id 등)
      console.log('🔍 1. Fetching UserAsset information...');
      const userAsset = await transactionManager.findOne(UserAsset, {
        where: { id: userAssetId },
        relations: ['category', 'asset'], // 관계 데이터도 함께 조회
      });

      console.log('�� Found UserAsset:', userAsset);

      if (!userAsset) {
        console.log('❌ UserAsset not found!');
        throw new Error('UserAsset not found');
      }

      // 2. AssetHistory 생성
      console.log('🔍 2. Creating AssetHistory...');
      console.log('�� AssetHistory data:');
      console.log('   user_asset_id:', userAssetId);
      console.log('   recorded_at:', recorded_at, '→', new Date(recorded_at));
      console.log('   asset_history_type_id:', asset_history_type_id);
      console.log('   price:', price, '→', price.toString());
      console.log('   quantity:', quantity, '→', quantity.toString());
      console.log(
        '   total_amount:',
        price * quantity,
        '→',
        (price * quantity).toString(),
      );
      console.log('   memo:', memo);

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

      console.log('📊 Created AssetHistory entity:', assetHistory);

      await transactionManager.save(assetHistory);
      console.log('✅ AssetHistory saved to database');

      // 3. 매수/매도인 경우 수량 업데이트
      if (asset_history_type_id === 1 || asset_history_type_id === 2) {
        console.log(
          '🔍 3. Updating UserAsset quantity (buy/sell transaction)...',
        );
        console.log(
          '   Transaction type:',
          asset_history_type_id === 1 ? 'BUY' : 'SELL',
        );
        console.log('   Quantity to add/subtract:', quantity);

        await this.updateUserAssetQuantity(
          userAssetId,
          asset_history_type_id,
          quantity,
          transactionManager, // 같은 트랜잭션의 manager 전달
        );
        console.log('✅ UserAsset quantity updated');
      } else {
        console.log(
          '🔍 3. Skipping quantity update (not buy/sell transaction)',
        );
      }

      // 4. 필요한 모든 데이터를 포함하여 반환
      console.log('🔍 4. Preparing response data...');
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

      console.log('📊 Response data prepared:', responseData);
      console.log('🔍 === createAssetHistory END ===');

      return responseData;
    };

    // manager가 있으면 기존 트랜잭션 사용, 없으면 새 트랜잭션 생성
    if (manager) {
      console.log('🔍 Using existing transaction manager');
      return await executeInTransaction(manager);
    } else {
      console.log('🔍 Creating new transaction');
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
    console.log('🔍 === createUserAssetAndAssetHistory START ===');
    console.log('📊 Input Parameters:');
    console.log('  categoryId:', categoryId, '(', typeof categoryId, ')');
    console.log('  assetId:', assetId, '(', typeof assetId, ')');
    console.log('  userId:', userId, '(', typeof userId, ')');
    console.log('  DTO:', createAssetHistoryRequestDto);

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
      console.log('🔍 1. Creating new UserAsset...');
      console.log('🔍 UserAsset data:');
      console.log('   category_id:', categoryId);
      console.log('   asset_id:', assetId);
      console.log('   institution_id:', institution_id);
      console.log('   currency_code_id:', currency_code_id);
      console.log('   avg_price:', price, '→', price.toString());
      console.log('   quantity:', quantity, '→', quantity.toString());

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

      console.log('📊 Created UserAsset entity:', userAsset);

      await manager.save(userAsset);
      console.log('✅ UserAsset saved to database');

      // 2. 생성된 UserAsset 조회 (institution_id, currency_code_id 포함)
      console.log('🔍 2. Fetching created UserAsset...');
      const findUserAsset = await manager.findOne(UserAsset, {
        where: {
          category_id: categoryId,
          asset_id: assetId,
          institution_id,
          currency_code_id,
        },
      });

      console.log('�� Found created UserAsset:', findUserAsset);

      if (!findUserAsset) {
        console.log('❌ Created UserAsset not found!');
        throw new Error('UserAsset not found');
      }

      // 3. 거래내역 생성
      console.log('🔍 3. Creating AssetHistory for new UserAsset...');
      const assetHistory = await this.createAssetHistory(
        createAssetHistoryRequestDto,
        findUserAsset.id,
        manager, // 기존 트랜잭션의 manager 전달
      );

      console.log('📊 AssetHistory created:', assetHistory);

      // 4. 동일한 구조로 반환
      console.log('🔍 4. Preparing response data...');
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

      console.log('📊 Response data prepared:', responseData);
      console.log('🔍 === createUserAssetAndAssetHistory END ===');

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
    console.log('🔍 === updateUserAssetQuantity START ===');
    console.log('📊 Input Parameters:');
    console.log('  userAssetId:', userAssetId, '(', typeof userAssetId, ')');
    console.log(
      '  assetHistoryTypeId:',
      assetHistoryTypeId,
      '(',
      typeof assetHistoryTypeId,
      ')',
    );
    console.log('  quantity:', quantity, '(', typeof quantity, ')');

    // 트랜잭션 실행 함수
    const executeInTransaction = async (transactionManager: any) => {
      const userAsset = await transactionManager.findOne(UserAsset, {
        where: { id: userAssetId },
      });

      console.log('📊 Found UserAsset for quantity update:', userAsset);

      if (!userAsset) {
        console.log('❌ UserAsset not found for quantity update!');
        throw new Error('UserAsset not found');
      }

      const currentQuantity = Number(userAsset.quantity);
      console.log('📊 Current quantity:', currentQuantity);
      console.log('�� Quantity to change:', quantity);

      let newQuantity: number;

      if (assetHistoryTypeId === 1) {
        newQuantity = currentQuantity + quantity;
        console.log('🔍 BUY transaction: adding quantity');
        console.log(
          '   Current:',
          currentQuantity,
          '+',
          quantity,
          '=',
          newQuantity,
        );
      } else if (assetHistoryTypeId === 2) {
        newQuantity = currentQuantity - quantity;
        console.log('🔍 SELL transaction: subtracting quantity');
        console.log(
          '   Current:',
          currentQuantity,
          '-',
          quantity,
          '=',
          newQuantity,
        );

        if (newQuantity < 0) {
          console.log('❌ Quantity cannot be negative!');
          throw new Error('Quantity cannot be negative');
        }
      } else {
        console.log('🔍 Not buy/sell transaction, skipping quantity update');
        return;
      }

      console.log(
        '�� Updating UserAsset quantity from',
        currentQuantity,
        'to',
        newQuantity,
      );

      await transactionManager.update(UserAsset, userAssetId, {
        quantity: newQuantity.toString(),
      });

      console.log('✅ UserAsset quantity updated successfully');
      console.log('🔍 === updateUserAssetQuantity END ===');

      return newQuantity;
    };

    // manager가 있으면 기존 트랜잭션 사용, 없으면 새 트랜잭션 생성
    if (manager) {
      console.log('🔍 Using existing transaction manager for quantity update');
      return await executeInTransaction(manager);
    } else {
      console.log('🔍 Creating new transaction for quantity update');
      return this.dataSource.transaction(executeInTransaction);
    }
  }
}
