import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { StockInfo } from '../../entities/stock/stock-info.entity';
import { EtfInfo } from '../../entities/etf/etf-info.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OverseasMasterSeeder {
  private readonly logger = new Logger(OverseasMasterSeeder.name);
  private filePath = path.join(process.cwd(), 'overseas-master.xlsx');
  private readonly exchangeMap: Record<string, string> = {
    나스닥: 'NASDAQ',
    아멕스: 'AMEX',
    뉴욕: 'NYSE',
  };

  constructor(
    @InjectRepository(StockInfo)
    private readonly stockInfoRepo: Repository<StockInfo>,
    @InjectRepository(EtfInfo)
    private readonly etfInfoRepo: Repository<EtfInfo>,
  ) {}

  async run(): Promise<void> {
    await this.parseExcelAndInsert();
  }

  async parseExcelAndInsert(): Promise<void> {
    if (!fs.existsSync(this.filePath)) {
      this.logger.error(`❌ 엑셀 파일을 찾을 수 없습니다: ${this.filePath}`);
      return;
    }

    const workbook = xlsx.readFile(this.filePath);
    const sheetName = workbook.SheetNames[0]; // 첫번째 시트
    const sheet = workbook.Sheets[sheetName]; // 첫 번째 시트에 해당하는 원시 데이터 객체
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: '' }); // JSON 형태로 변환한 배열

    console.log(`sheetName = ${sheetName}`);
    console.log(`sheet = ${sheet}`);
    console.log(`jsonData = ${jsonData}`);

    const stocks: StockInfo[] = [];
    const etfs: EtfInfo[] = [];

    jsonData.forEach((row: any) => {
      const marketRaw = String(row['Exchange name'] ?? '').trim();
      const ticker = String(row['Symbol'] ?? '').trim();
      const kor_name = String(row['Korea name'] ?? '').trim();
      const eng_name = String(row['English name'] ?? '').trim();

      const asset_type = String(
        row['Security type(1:Index,2:Stock,3:ETP(ETF),4:Warrant)'] ?? '',
      ).trim();

      // exchangeMap을 사용해서 market 값을 변환
      const market = this.exchangeMap[marketRaw] ?? marketRaw;

      if (asset_type === '2') {
        stocks.push({
          ticker,
          kor_name,
          eng_name,
          market: market,
          currency_code_id: 2,
          created_at: new Date(),
        } as StockInfo);
      } else if (asset_type === '3') {
        etfs.push({
          ticker,
          kor_name,
          eng_name,
          market: market,
          currency_code_id: 2,
          created_at: new Date(),
        } as EtfInfo);
      } else {
        this.logger.log(`🚫 무시: ${ticker} | ${kor_name} | ${asset_type}`);
      }
    });

    if (stocks.length > 0) {
      await this.stockInfoRepo.upsert(stocks, ['ticker']);
      this.logger.log(`✅ ${stocks.length}개의 주식 데이터 upsert 완료`);
    }

    if (etfs.length > 0) {
      await this.etfInfoRepo.upsert(etfs, ['ticker']);
      this.logger.log(`✅ ${etfs.length}개의 ETF 데이터 upsert 완료`);
    }
  }
}
