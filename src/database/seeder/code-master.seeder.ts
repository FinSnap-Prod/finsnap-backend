import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetType } from '../entities/code/asset-type.entity';
import { AssetHistoryType } from '../entities/code/asset-history-type.entity';
import { CurrencyCode } from '../entities/code/currency-code.entity';
import { Institution } from '../entities/code/institution.entity';
import { InterestType } from '../entities/code/interest-type.entity';
import { MarketRegion } from '../entities/code/market-region.entity';

@Injectable()
export class CodeMasterSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    console.log('🚀 Starting Code Master Seeder...');

    const queryRunner = this.dataSource.createQueryRunner(); // 쿼리 러너 생성
    await queryRunner.connect(); // 쿼리 러너 연결
    await queryRunner.startTransaction(); // 트랜잭션 시작

    try {
      // 1. Asset Type 데이터 생성
      await this.seedAssetTypes(queryRunner);

      // 2. Asset History Type 데이터 생성
      await this.seedAssetHistoryTypes(queryRunner);

      // 3. Currency Code 데이터 생성
      await this.seedCurrencyCodes(queryRunner);

      // 4. Institution 데이터 생성
      await this.seedInstitutions(queryRunner);

      // 5. Interest Type 데이터 생성
      await this.seedInterestTypes(queryRunner);

      // 6. Market Region 데이터 생성
      await this.seedMarketRegions(queryRunner);

      await queryRunner.commitTransaction(); // 트랜잭션 커밋
      console.log('✅ Code Master Seeder completed successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 트랜잭션 롤백
      console.error('❌ Code Master Seeder failed:', error);
      throw error;
    } finally {
      await queryRunner.release(); // 트랜잭션 릴리즈
    }
  }

  private async seedAssetTypes(queryRunner: any) {
    const assetTypes = [
      { id: 1, type_name: 'STOCK', display_name: '주식' },
      { id: 2, type_name: 'ETF', display_name: 'ETF' },
      { id: 3, type_name: 'CRYPTO', display_name: '암호화폐' },
      { id: 4, type_name: 'DEPOSIT', display_name: '예금' },
      { id: 5, type_name: 'SAVING', display_name: '적금' },
    ];

    for (const assetType of assetTypes) {
      const existing = await queryRunner.manager.findOne(AssetType, {
        where: { id: assetType.id },
      });

      if (!existing) {
        await queryRunner.manager.insert(AssetType, assetType);
        console.log(
          `✅ Created AssetType: ${assetType.type_name} (${assetType.display_name})`,
        );
      }
    }
  }

  private async seedAssetHistoryTypes(queryRunner: any) {
    const historyTypes = [
      { id: 1, type_name: 'buy', display_name: '매수' },
      { id: 2, type_name: 'sell', display_name: '매도' },
      { id: 3, type_name: 'deposit', display_name: '입금' },
      { id: 4, type_name: 'withdraw', display_name: '출금' },
      { id: 5, type_name: 'exchange', display_name: '환전' },
      { id: 6, type_name: 'dividend', display_name: '배당' },
      { id: 7, type_name: 'interest', display_name: '이자' },
      { id: 8, type_name: 'fee', display_name: '수수료' },
      { id: 9, type_name: 'tax', display_name: '세금' },
      { id: 10, type_name: 'other', display_name: '기타' },
    ];

    for (const historyType of historyTypes) {
      const existing = await queryRunner.manager.findOne(AssetHistoryType, {
        where: { id: historyType.id },
      });

      if (!existing) {
        await queryRunner.manager.insert(AssetHistoryType, historyType);
        console.log(
          `✅ Created AssetHistoryType: ${historyType.type_name} (${historyType.display_name})`,
        );
      }
    }
  }
  private async seedCurrencyCodes(queryRunner: any) {
    const currencyCodes = [
      { id: 1, currency_code: 'KRW', display_name: '한국 원', symbol: '₩' },
      { id: 2, currency_code: 'USD', display_name: '미국 달러', symbol: '$' },
      { id: 3, currency_code: 'EUR', display_name: '유로', symbol: '€' },
      { id: 4, currency_code: 'JPY', display_name: '일본 엔', symbol: '¥' },
      { id: 5, currency_code: 'CNY', display_name: '중국 위안', symbol: '¥' },
      { id: 6, currency_code: 'BTC', display_name: '비트코인', symbol: '₿' },
      { id: 7, currency_code: 'ETH', display_name: '이더리움', symbol: 'Ξ' },
      { id: 8, currency_code: 'USDT', display_name: '테더', symbol: '₮' },
      { id: 9, currency_code: 'XRP', display_name: '리플', symbol: 'XRP' },
      {
        id: 10,
        currency_code: 'USDC',
        display_name: 'USD 코인',
        symbol: 'USDC',
      },
    ];

    for (const currencyCode of currencyCodes) {
      const existing = await queryRunner.manager.findOne(CurrencyCode, {
        where: { id: currencyCode.id },
      });

      if (!existing) {
        await queryRunner.manager.insert(CurrencyCode, currencyCode);
        console.log(
          `✅ Created CurrencyCode: ${currencyCode.currency_code} (${currencyCode.display_name})`,
        );
      }
    }
  }

  private async seedInstitutions(queryRunner: any) {
    const institutions = [
      { id: 1, type_name: 'BROKER', display_name: '키움증권' },
      { id: 2, type_name: 'BROKER', display_name: '대신증권' },
      { id: 3, type_name: 'BROKER', display_name: 'NH투자증권' },
      { id: 4, type_name: 'BROKER', display_name: '한국투자증권' },
      { id: 5, type_name: 'BROKER', display_name: '미래에셋증권' },
      { id: 6, type_name: 'BROKER', display_name: '삼성증권' },
      { id: 7, type_name: 'BROKER', display_name: 'KB증권' },
      { id: 8, type_name: 'BROKER', display_name: '신한금융투자' },
      { id: 9, type_name: 'BROKER', display_name: '하나금융투자' },
      { id: 10, type_name: 'BROKER', display_name: '메리츠증권' },
      { id: 11, type_name: 'BROKER', display_name: '유안타증권' },
      { id: 12, type_name: 'BROKER', display_name: '대신증권' },
      { id: 13, type_name: 'BROKER', display_name: '교보증권' },
      { id: 14, type_name: 'BROKER', display_name: '하이투자증권' },
      { id: 15, type_name: 'BROKER', display_name: 'SK증권' },
      { id: 16, type_name: 'BROKER', display_name: '대우증권' },
      { id: 17, type_name: 'BROKER', display_name: 'DB증권' },
      { id: 18, type_name: 'BROKER', display_name: '신영증권' },
      { id: 19, type_name: 'BROKER', display_name: '현대증권' },
      { id: 20, type_name: 'BROKER', display_name: '카카오증권' },
      { id: 21, type_name: 'BROKER', display_name: '토스증권' },
      { id: 22, type_name: 'BANK', display_name: '국민은행' },
      { id: 23, type_name: 'BANK', display_name: '신한은행' },
      { id: 24, type_name: 'BANK', display_name: '우리은행' },
      { id: 25, type_name: 'BANK', display_name: '하나은행' },
      { id: 26, type_name: 'BANK', display_name: '농협은행' },
      { id: 27, type_name: 'BANK', display_name: '씨티은행' },
      { id: 28, type_name: 'BANK', display_name: 'SC제일은행' },
      { id: 29, type_name: 'BANK', display_name: '신협' },
      { id: 30, type_name: 'BANK', display_name: '새마을금고' },
      { id: 31, type_name: 'BANK', display_name: '저축은행' },
      { id: 32, type_name: 'BANK', display_name: 'iM뱅크' },
      { id: 33, type_name: 'BANK', display_name: 'BNK부산은행' },
      { id: 34, type_name: 'BANK', display_name: '우체국' },
      { id: 35, type_name: 'BANK', display_name: '케이뱅크' },
      { id: 36, type_name: 'BANK', display_name: '카카오뱅크' },
      { id: 37, type_name: 'BANK', display_name: '토스뱅크' },
      { id: 38, type_name: 'CRYPTO', display_name: '업비트' },
      { id: 39, type_name: 'CRYPTO', display_name: '빗썸' },
      { id: 40, type_name: 'CRYPTO', display_name: '코인원' },
      { id: 41, type_name: 'CRYPTO', display_name: 'Bybit' },
      { id: 42, type_name: 'CRYPTO', display_name: 'Binance' },
      { id: 43, type_name: 'CRYPTO', display_name: 'Coinbase' },
      { id: 44, type_name: 'CRYPTO', display_name: 'OKX' },
    ];

    for (const institution of institutions) {
      const existing = await queryRunner.manager.findOne(Institution, {
        where: { id: institution.id },
      });

      if (!existing) {
        await queryRunner.manager.insert(Institution, institution);
        console.log(
          `✅ Created Institution: ${institution.type_name} - ${institution.display_name}`,
        );
      }
    }
  }

  private async seedInterestTypes(queryRunner: any) {
    const interestTypes = [
      { id: 1, type_name: 'SIMPLE', display_name: '단리' },
      { id: 2, type_name: 'COMPOUND', display_name: '복리' },
    ];

    for (const interestType of interestTypes) {
      const existing = await queryRunner.manager.findOne(InterestType, {
        where: { id: interestType.id },
      });

      if (!existing) {
        await queryRunner.manager.insert(InterestType, interestType);
        console.log(
          `✅ Created InterestType: ${interestType.type_name} (${interestType.display_name})`,
        );
      }
    }
  }

  private async seedMarketRegions(queryRunner: any) {
    const marketRegions = [
      { id: 1, type_name: 'DOMESTIC', display_name: '국내' },
      { id: 2, type_name: 'OVERSEAS', display_name: '해외' },
    ];

    for (const marketRegion of marketRegions) {
      const existing = await queryRunner.manager.findOne(MarketRegion, {
        where: { id: marketRegion.id },
      });

      if (!existing) {
        await queryRunner.manager.insert(MarketRegion, marketRegion);
        console.log(
          `✅ Created MarketRegion: ${marketRegion.type_name} (${marketRegion.display_name})`,
        );
      }
    }
  }
}
