import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { DepositInfo } from '../../../../database/entities/deposit/deposit-info.entity';
import { DepositType } from '../../../../database/entities/deposit/deposit-type.entity';
import { DepositMarketData } from '../../../../database/entities/deposit/deposit-market-data.entity';
import { Repository } from 'typeorm';
import { InterestType } from '../../../entities/code/interest-type.entity';

/**
 * 적금 마스터 데이터 시더
 * 금융감독원 API에서 적금 상품 정보를 수집하여 데이터베이스에 저장
 */
@Injectable()
export class SavingMasterSeeder {
  private readonly logger = new Logger(SavingMasterSeeder.name);
  private readonly FSS_API_URL =
    'http://finlife.fss.or.kr/finlifeapi/savingProductsSearch.json';
  private readonly FINANCIAL_GROUP_CODES = [
    '020000', // 은행
    '030200', // 여신전문금융
    '030300', // 저축은행
    '050000', // 보험
    '060000', // 금융투자
  ];

  constructor(
    @InjectRepository(DepositInfo)
    private readonly depositInfoRepo: Repository<DepositInfo>,
    @InjectRepository(DepositType)
    private readonly depositTypeRepo: Repository<DepositType>,
    @InjectRepository(DepositMarketData)
    private readonly depositMarketDataRepo: Repository<DepositMarketData>,
    @InjectRepository(InterestType)
    private readonly interestTypeRepo: Repository<InterestType>,
  ) {}

  /**
   * 시더 실행 메인 함수
   */
  async run() {
    this.logger.log('💰 Starting Saving Master Seeder...');

    await this.createDefaultTypes();
    await this.fetchAndSaveSavingInfo();
    await this.fetchAndSaveSavingMarketData();

    this.logger.log('✅ Saving Master Seeder completed successfully!');
  }

  /**
   * 기본 타입들 생성 (예적금 타입, 이자 타입)
   */
  private async createDefaultTypes() {
    await this.createDefaultDepositTypes();
    await this.createDefaultInterestTypes();
  }

  /**
   * 기본 예적금 타입 생성
   */
  private async createDefaultDepositTypes() {
    try {
      const existingTypes = await this.depositTypeRepo.find();
      if (existingTypes.length === 0) {
        const defaultTypes = [{ type_name: '예금' }, { type_name: '적금' }];

        for (const typeData of defaultTypes) {
          const depositType = this.depositTypeRepo.create(typeData);
          await this.depositTypeRepo.save(depositType);
        }
        this.logger.log('✅ Default deposit types created: 예금, 적금');
      }
    } catch (error) {
      this.logger.error('❌ Error creating default deposit types:', error);
    }
  }

  /**
   * 기본 이자 타입 생성
   */
  private async createDefaultInterestTypes() {
    try {
      const existingTypes = await this.interestTypeRepo.find();
      if (existingTypes.length === 0) {
        const defaultTypes = [{ type_name: '단리' }, { type_name: '복리' }];

        for (const typeData of defaultTypes) {
          const interestType = this.interestTypeRepo.create(typeData);
          await this.interestTypeRepo.save(interestType);
        }
        this.logger.log('✅ Default interest types created: 단리, 복리');
      }
    } catch (error) {
      this.logger.error('❌ Error creating default interest types:', error);
    }
  }

  /**
   * 적금 정보 수집 및 저장
   */
  private async fetchAndSaveSavingInfo() {
    try {
      this.logger.log('📊 Fetching saving info from API...');

      const results = await this.fetchFromAPI('baseList');
      if (results.length === 0) {
        this.logger.warn('⚠️ No saving info results from API');
        return;
      }

      const savingType = await this.getDepositType('적금');
      if (!savingType) return;

      const savingInfos = this.mapToSavingInfo(results, savingType.id);
      const uniqueSavingInfos = this.removeDuplicates(
        savingInfos,
        'product_code',
      );

      await this.depositInfoRepo.upsert(uniqueSavingInfos, ['product_code']);
      this.logger.log(
        `✅ Saved ${uniqueSavingInfos.length} saving info records`,
      );
    } catch (error) {
      this.logger.error('❌ Error fetching saving info:', error);
    }
  }

  /**
   * 12개월 적금 옵션 정보 수집 및 저장
   */
  private async fetchAndSaveSavingMarketData() {
    try {
      this.logger.log('📈 Fetching saving market data from API...');

      const results = await this.fetchFromAPI('optionList', '12');
      if (results.length === 0) {
        this.logger.warn('⚠️ No market data results from API');
        return;
      }

      const existingSavings = await this.depositInfoRepo.find();
      const savingMap = new Map(
        existingSavings.map((d) => [d.product_code, d.id]),
      );

      const marketDataList = this.mapToSavingMarketData(results, savingMap);
      const uniqueMarketData = this.removeDuplicates(
        marketDataList,
        'deposit_info_id',
        'period',
      );

      await this.depositMarketDataRepo.upsert(uniqueMarketData, [
        'deposit_info_id',
        'period',
      ]);
      this.logger.log(
        `✅ Saved ${uniqueMarketData.length} saving market data records`,
      );
    } catch (error) {
      this.logger.error('❌ Error fetching saving market data:', error);
    }
  }

  /**
   * API에서 데이터 수집 (공통 메서드)
   */
  private async fetchFromAPI(
    dataType: 'baseList' | 'optionList',
    period?: string,
  ) {
    let allResults: any[] = [];
    let totalBeforeFilter = 0;

    for (const groupCode of this.FINANCIAL_GROUP_CODES) {
      try {
        // 첫 번째 페이지로 max_page_no 확인
        const firstPageResponse = await axios.get(this.FSS_API_URL, {
          params: {
            auth: process.env.FSS_API_KEY,
            topFinGrpNo: groupCode,
            pageNo: 1,
          },
        });

        const maxPageNo = firstPageResponse.data?.result?.max_page_no || 1;
        this.logger.log(
          `📄 Group ${groupCode}: Total ${maxPageNo} pages available`,
        );

        // 모든 페이지 순회
        for (let pageNo = 1; pageNo <= maxPageNo; pageNo++) {
          try {
            const { data } = await axios.get(this.FSS_API_URL, {
              params: {
                auth: process.env.FSS_API_KEY,
                topFinGrpNo: groupCode,
                pageNo: pageNo,
              },
            });

            if (data?.result?.[dataType]) {
              let items = data.result[dataType];
              totalBeforeFilter += items.length;

              // 12개월 옵션 필터링
              if (dataType === 'optionList' && period) {
                const beforeCount = items.length;
                items = items.filter(
                  (option: any) => option.save_trm === period,
                );
                const afterCount = items.length;

                if (beforeCount !== afterCount) {
                  this.logger.log(
                    `🔍 Filtered: ${beforeCount} → ${afterCount} (${period}개월만)`,
                  );
                }
              }

              allResults = allResults.concat(items);
              this.logger.log(
                `✅ Added ${items.length} items from group ${groupCode} (page ${pageNo}/${maxPageNo})`,
              );
            }

            // API Rate Limit 방지를 위한 대기 (페이지 간 100ms)
            if (pageNo < maxPageNo) {
              await this.delay(100);
            }
          } catch (error) {
            this.logger.error(
              `❌ Error fetching page ${pageNo} from group ${groupCode}:`,
              error.message,
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `❌ Error fetching from group ${groupCode}:`,
          error.message,
        );
      }
    }

    if (dataType === 'optionList' && period) {
      this.logger.log(
        `📊 Total ${dataType} before filtering: ${totalBeforeFilter}`,
      );
      this.logger.log(
        `📊 Total ${dataType} after filtering (${period}개월): ${allResults.length}`,
      );
      this.logger.log(
        `📊 Filtered out: ${totalBeforeFilter - allResults.length} items`,
      );
    } else {
      this.logger.log(`📊 Total ${dataType} collected: ${allResults.length}`);
    }

    return allResults;
  }

  /**
   * 예적금 타입 조회
   */
  private async getDepositType(typeName: string) {
    const depositType = await this.depositTypeRepo.findOne({
      where: { type_name: typeName },
    });

    if (!depositType) {
      this.logger.error(`❌ ${typeName} type not found in database`);
      return null;
    }

    return depositType;
  }

  /**
   * API 응답을 SavingInfo 엔티티로 변환
   */
  private mapToSavingInfo(
    results: any[],
    depositTypeId: number,
  ): DepositInfo[] {
    return results.map((d) => {
      const savingInfo = new DepositInfo();
      savingInfo.name = d.fin_prdt_nm || '';
      savingInfo.product_code = d.fin_prdt_cd || '';
      savingInfo.bank_name = d.kor_co_nm || '';
      savingInfo.bank_code = d.fin_co_no || '';
      savingInfo.report_month = d.dcls_month || '';
      savingInfo.deposit_type_id = depositTypeId;
      return savingInfo;
    });
  }

  /**
   * API 응답을 SavingMarketData 엔티티로 변환
   */
  private mapToSavingMarketData(
    results: any[],
    savingMap: Map<string, number>,
  ): DepositMarketData[] {
    return results
      .map((d) => {
        const savingInfoId = savingMap.get(d.fin_prdt_cd);
        if (!savingInfoId) {
          this.logger.warn(
            `⚠️ No matching saving_info for product_code: ${d.fin_prdt_cd}`,
          );
          return null;
        }

        const marketData = new DepositMarketData();
        marketData.deposit_info_id = savingInfoId;
        marketData.interest_type_id = 1; // 기본값
        marketData.period = d.save_trm || '';
        marketData.interest_rate = d.intr_rate?.toString() || '0';
        marketData.max_prefer_rate = d.intr_rate2?.toString() || '0';
        return marketData;
      })
      .filter((item) => item !== null);
  }

  /**
   * 중복 제거 (공통 메서드)
   */
  private removeDuplicates<T>(items: T[], ...keys: (keyof T)[]): T[] {
    return items.filter((item, index, self) => {
      const itemKey = keys.map((key) => item[key]).join('|');
      return (
        index ===
        self.findIndex(
          (other) => keys.map((key) => other[key]).join('|') === itemKey,
        )
      );
    });
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
