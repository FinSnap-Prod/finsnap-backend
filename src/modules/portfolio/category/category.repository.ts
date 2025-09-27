import { Injectable } from '@nestjs/common';
import { Category } from 'src/database/entities/portfolio/category.entity';
import { Portfolio } from 'src/database/entities/portfolio/portfolio.entity';
import { DataSource, In } from 'typeorm';
import {
  GetCategoriesSummaryParamDto,
  GetCategoriesSummaryQueryDto,
} from '../dto';
import { UserAsset } from 'src/database/entities/portfolio/user-asset.entity';
import { Asset } from 'src/database/entities/asset/asset.entity';
import { StockInfo } from 'src/database/entities/stock/stock-info.entity';
import { StockMarketData } from 'src/database/entities/stock/stock-market-data.entity';
import { CryptoInfo } from 'src/database/entities/crypto/crypto-info.entity';
import { CryptoMarketData } from 'src/database/entities/crypto/crypto-market-data.entity';
import { EtfInfo } from 'src/database/entities/etf/etf-info.entity';
import { EtfMarketData } from 'src/database/entities/etf/etf-market-data.entity';
import { CurrencyCode } from 'src/database/entities/code/currency-code.entity';
import { ExchangeRateDaily } from 'src/database/entities/exchange/exchange-rate-daily.entity';

@Injectable()
export class CategoryRepository {
  constructor(private dataSource: DataSource) {}

  async executeGetCategoryTransaction(
    getCategoriesSummaryParamDto: GetCategoriesSummaryParamDto,
    getCategoriesSummaryQueryDto: GetCategoriesSummaryQueryDto,
    userId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const { portfolio_id } = getCategoriesSummaryParamDto;
      const { sortBy, order, category_id } = getCategoriesSummaryQueryDto;

      // 1) 포트폴리오 존재/소유권 검증
      const portfolio = await manager.findOne(Portfolio, {
        where: { id: portfolio_id, user_id: userId },
      });

      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      // 2) 포트폴리오 내 카테고리 조회
      const allCategories = await manager.find(Category, {
        where: { portfolio_id },
        order: { sort_order: 'ASC' },
      });

      // 3) 대상 카테고리 결정 및 검증
      let targetCategoryIds: number[] = [];
      if (category_id == null) {
        targetCategoryIds = allCategories.map((c) => c.id);
      } else {
        const exists = allCategories.some((c) => c.id === Number(category_id));
        if (!exists) {
          throw new Error('Category not found');
        }
        targetCategoryIds = [Number(category_id)];
      }

      // 4) 대상 카테고리에 속한 사용자 자산 조회
      let userAssets: UserAsset[] = [];
      if (targetCategoryIds.length > 0) {
        userAssets = await manager.find(UserAsset, {
          where: { category_id: In(targetCategoryIds) },
          relations: ['asset', 'asset.asset_type', 'category', 'currency_code'],
        });
      }

      // 5) 자산명 조회 (asset_type에 따라 개별 테이블에서 kor_name/eng_name 가져오기)
      const assetsWithName = await Promise.all(
        userAssets.map(async (ua) => {
          const assetInfo = await manager.findOne(Asset, {
            where: { id: ua.asset_id },
            relations: ['asset_type'],
          });

          if (!assetInfo) {
            throw new Error('Asset not found');
          }

          let assetName = '';
          let marketPrice: number | undefined = undefined;
          const assetType = assetInfo.asset_type?.type_name?.toLowerCase();
          switch (assetType) {
            case 'stock': {
              const info = await manager.findOne(StockInfo, {
                where: { id: assetInfo.asset_info_id },
                select: ['kor_name', 'eng_name'],
              });
              assetName = info?.kor_name || info?.eng_name || '';
              const m = await manager.findOne(StockMarketData, {
                where: { stock_info_id: assetInfo.asset_info_id },
                select: ['price'],
              });
              marketPrice = m ? Number(m.price) : undefined;
              break;
            }
            case 'crypto': {
              const info = await manager.findOne(CryptoInfo, {
                where: { id: assetInfo.asset_info_id },
                select: ['kor_name', 'eng_name'],
              });
              assetName = info?.kor_name || info?.eng_name || '';
              const m = await manager.findOne(CryptoMarketData, {
                where: { crypto_info_id: assetInfo.asset_info_id },
                select: ['price'],
              });
              marketPrice = m ? Number(m.price) : undefined;
              break;
            }
            case 'etf': {
              const info = await manager.findOne(EtfInfo, {
                where: { id: assetInfo.asset_info_id },
                select: ['kor_name', 'eng_name'],
              });
              assetName = info?.kor_name || info?.eng_name || '';
              const m = await manager.findOne(EtfMarketData, {
                where: { etf_info_id: assetInfo.asset_info_id },
                select: ['price'],
              });
              marketPrice = m ? Number(m.price) : undefined;
              break;
            }
            default: {
              assetName = '';
            }
          }

          return { ua, assetName, marketPrice };
        }),
      );

      // 6) 정렬 기준/방향 결정
      // - 기본 정렬: valuation(desc) → 내부적으로 eval_amount 사용
      const sortKey = (sortBy || 'valuation').toLowerCase();
      const sortDir = (order || 'desc').toLowerCase() === 'desc' ? -1 : 1;

      const sorted = [...assetsWithName].sort((a, b) => {
        const aQty = Number(a.ua.quantity || 0);
        const bQty = Number(b.ua.quantity || 0);
        const aAvg = Number(a.ua.avg_price || 0);
        const bAvg = Number(b.ua.avg_price || 0);
        const aPurchase = aAvg * aQty;
        const bPurchase = bAvg * bQty;
        let aEval = Number(a.ua.eval_amount);
        let bEval = Number(b.ua.eval_amount);
        if (!isFinite(aEval) || aEval <= 0) aEval = (a.marketPrice ?? 0) * aQty;
        if (!isFinite(bEval) || bEval <= 0) bEval = (b.marketPrice ?? 0) * bQty;
        let aProfit = Number(a.ua.profit_loss);
        let bProfit = Number(b.ua.profit_loss);
        if (!isFinite(aProfit)) aProfit = aEval - aPurchase;
        if (!isFinite(bProfit)) bProfit = bEval - bPurchase;
        let aRate = Number(a.ua.profit_rate);
        let bRate = Number(b.ua.profit_rate);
        if (!isFinite(aRate)) aRate = aPurchase > 0 ? aProfit / aPurchase : 0;
        if (!isFinite(bRate)) bRate = bPurchase > 0 ? bProfit / bPurchase : 0;

        switch (sortKey) {
          case 'purchase_amount':
            return (aPurchase - bPurchase) * sortDir;
          case 'profit_amount':
            return (aProfit - bProfit) * sortDir;
          case 'profit_rate':
            return (aRate - bRate) * sortDir;
          case 'valuation':
            return (aEval - bEval) * sortDir;
          case 'name':
          default:
            return a.assetName.localeCompare(b.assetName) * sortDir;
        }
      });

      // 7) FX 맵 구성 (필요 시 USD/KRW 등)
      const fx: Record<string, number> = {};
      // 기본 디스플레이 통화 가정 (프로젝트 정책에 맞게 조정 가능)
      const displayCurrency = 'KRW';

      // 통화 코드 조회 (USD/KRW)
      const currencyCodes = await manager.find(CurrencyCode, {
        where: { currency_code: In(['USD', 'USDT', 'KRW']) },
      });

      const codeMap = new Map(
        currencyCodes.map((c) => [c.currency_code.toUpperCase(), c.id]),
      );

      const usdId = codeMap.get('USD');
      const usdtId = codeMap.get('USDT');
      const krwId = codeMap.get('KRW');

      const needUsdKrw = sorted.some(
        ({ ua }) => ua.currency_code?.currency_code?.toUpperCase() === 'USD',
      );
      const needUsdtKrw = sorted.some(
        ({ ua }) => ua.currency_code?.currency_code?.toUpperCase() === 'USDT',
      );

      const fetchLatestFx = async (
        baseId?: number,
        quoteId?: number,
      ): Promise<number | undefined> => {
        if (!baseId || !quoteId) return undefined;
        const row = await manager.findOne(ExchangeRateDaily, {
          where: { base_currency_id: baseId, quote_currency_id: quoteId },
          order: { rate_date: 'DESC' },
        });
        return row ? Number(row.close) : undefined;
      };

      if (needUsdKrw) {
        const rate = await fetchLatestFx(usdId, krwId);
        if (rate) fx['USD/KRW'] = rate;
      }

      if (needUsdtKrw) {
        const rate = await fetchLatestFx(usdtId, krwId);
        if (rate) fx['USDT/KRW'] = rate;
      }

      // 8) DTO 매핑
      const valuationTimestamp = new Date().toISOString();

      const categories = allCategories
        .filter((c) => targetCategoryIds.includes(c.id))
        .map((c) => ({ category_id: c.id, category_name: c.name }));

      const assets = sorted.map(({ ua, assetName, marketPrice }) => {
        const nativeCurrency = ua.currency_code?.currency_code || 'KRW';
        const qty = Number(ua.quantity || 0);
        const avgPrice = Number(ua.avg_price || 0);
        let evalAmount = Number(ua.eval_amount);
        const purchaseAmount = Number((avgPrice * qty).toFixed(2));
        // 단가: 시세 우선, 없으면 eval/qty 보정
        if (!isFinite(evalAmount) || evalAmount <= 0) {
          evalAmount = Number(((marketPrice ?? 0) * qty).toFixed(2));
        }
        const fallbackPrice = qty > 0 ? Number((evalAmount / qty).toFixed(6)) : 0;
        const unitPrice = marketPrice ?? fallbackPrice;
        let profitAmount = Number(ua.profit_loss);
        if (!isFinite(profitAmount)) {
          profitAmount = Number((evalAmount - purchaseAmount).toFixed(2));
        }
        let profitRate = Number(ua.profit_rate);
        if (!isFinite(profitRate)) {
          profitRate = purchaseAmount > 0 ? Number((profitAmount / purchaseAmount).toFixed(5)) : 0;
        }

        const conversion: Record<string, any> = {};
        // 항상 displayCurrency 항목을 포함해 FE에서 안전하게 접근 가능하도록 함
        if (displayCurrency.toUpperCase() === nativeCurrency.toUpperCase()) {
          conversion[displayCurrency] = {
            price: unitPrice,
            avg_price: avgPrice,
            purchase_amount: purchaseAmount,
            eval_amount: evalAmount,
            profit_amount: profitAmount,
          };
        } else if (
          displayCurrency === 'KRW' &&
          nativeCurrency.toUpperCase() === 'USD'
        ) {
          const pair = 'USD/KRW';
          const fxRate = fx[pair];
          if (fxRate) {
            conversion['KRW'] = {
              fx_pair: pair,
              fx_rate: fxRate,
              price: Number((unitPrice * fxRate).toFixed(2)),
              avg_price: Number((avgPrice * fxRate).toFixed(2)),
              purchase_amount: Number((purchaseAmount * fxRate).toFixed(0)),
              eval_amount: Number((evalAmount * fxRate).toFixed(0)),
              profit_amount: Number((profitAmount * fxRate).toFixed(0)),
            };
          }
        }

        return {
          asset_id: ua.asset_id,
          category_id: ua.category_id,
          category_name: ua.category?.name || '',
          asset_name: assetName || '',
          native: {
            currency: nativeCurrency,
            price: unitPrice,
            avg_price: avgPrice,
            quantity: qty,
            purchase_amount: purchaseAmount,
            eval_amount: evalAmount,
            profit_amount: profitAmount,
            profit_rate: profitRate,
          },
          conversion,
        };
      });

      return {
        success: true,
        message: 'Portfolio assets retrieved successfully.',
        data: {
          portfolio: {
            portfolio_id: portfolio.id,
            portfolio_name: portfolio.name,
            portfolio_currency: 'KRW',
            display_currency: 'KRW',
            valuation_timestamp: valuationTimestamp,
            sorted_by:
              sortKey === 'valuation' ? 'eval_amount' : sortKey || 'name',
          },
          fx,
          categories,
          assets,
        },
      };
    });
  }

  async executeCreateCategoryTransaction(
    userId: string,
    portfolioId: number,
    name: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // 1. 포트폴리오 존재 여부 및 소유권 검증
      const existingPortfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
      });

      if (!existingPortfolio) {
        throw new Error('Portfolio not found');
      }
      // 2. 카테고리 중복 조회
      const existingCategory = await manager.findOne(Category, {
        where: { name, portfolio_id: portfolioId },
      });

      if (existingCategory) {
        throw new Error('Category already exists');
      }

      // 3. 정렬 순서 최대값 조회
      const maxSortOrder = await manager.findOne(Category, {
        where: { portfolio_id: portfolioId },
        order: { sort_order: 'DESC' },
      });

      const newSortOrder = maxSortOrder ? maxSortOrder.sort_order + 1 : 1;

      // 4. 카테고리 생성
      const newCategory = await manager.save(Category, {
        name,
        portfolio_id: portfolioId,
        sort_order: newSortOrder,
      });

      // 5. 카테고리 생성 결과 반환
      const createdCategory = await manager.findOne(Category, {
        where: { id: newCategory.id },
      });

      return createdCategory;
    });
  }

  async executeDeleteCategoryTransaction(
    userId: string,
    portfolioId: number,
    categoryId: number,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // 1-1. 포트폴리오 존재 여부 및 소유권 검증
      const existingPortfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
      });

      if (!existingPortfolio) {
        throw new Error('Portfolio not found');
      }

      // 1-2. 카테고리 존재 여부 및 소유권 검증
      const existingCategory = await manager.findOne(Category, {
        where: { id: categoryId, portfolio_id: portfolioId },
      });

      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // 2. 삭제 포트폴리오 정렬 번호 조회
      const deletedSortOrder = existingCategory.sort_order;

      // 3. 포트폴리오 삭제
      await manager.delete(Category, { id: categoryId });

      // 4. 정렬 순서 업데이트
      await manager
        .createQueryBuilder()
        .update(Category)
        .set({ sort_order: () => 'sort_order - 1' })
        .where(
          'portfolio_id = :portfolioId AND sort_order > :deletedSortOrder',
          {
            portfolioId,
            deletedSortOrder,
          },
        )
        .execute();
    });
  }

  async executeUpdateCategoryTransaction(
    userId: string,
    portfolioId: number,
    categoryId: number,
    name: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // 1-1. 포트폴리오 존재 여부 및 소유권 검증
      const existingPortfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
      });

      if (!existingPortfolio) {
        throw new Error('Portfolio not found');
      }

      // 1-2. 카테고리 존재 여부 및 소유권 검증
      const existingCategory = await manager.findOne(Category, {
        where: { id: categoryId, portfolio_id: portfolioId },
      });

      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // 2. 카테고리 이름 중복 검증
      const existingCategoryWithSameName = await manager.findOne(Category, {
        where: { name, portfolio_id: portfolioId },
      });

      if (existingCategoryWithSameName) {
        throw new Error('Category name already exists');
      }

      // 3. 카테고리 이름 업데이트
      await manager
        .createQueryBuilder()
        .update(Category)
        .set({ name })
        .where('id = :id AND portfolio_id = :portfolioId', {
          id: categoryId,
          portfolioId,
        })
        .execute();

      // 4. 업데이트된 카테고리 조회
      const updatedCategory = await manager.findOne(Category, {
        where: { id: categoryId, portfolio_id: portfolioId },
      });

      return updatedCategory;
    });
  }
}
