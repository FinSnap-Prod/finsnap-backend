import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { StockInfo } from '../../entities/stock/stock-info.entity';
import { EtfInfo } from '../../entities/etf/etf-info.entity';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';

@Injectable()
export class KospiMasterSeeder {
  private readonly logger = new Logger(KospiMasterSeeder.name);
  private filePath = path.join(process.cwd(), 'kospi-master.xlsx');

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
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    const stocks: StockInfo[] = [];
    const etfs: EtfInfo[] = [];

    jsonData.forEach((row: any) => {
      const ticker = String(row['단축코드'] ?? '').trim();
      const korName = String(row['한글명'] ?? '').trim();
      const groupCode = String(row['그룹코드'] ?? '').trim();

      if (groupCode === 'ST') {
        stocks.push({
          ticker,
          kor_name: korName,
          eng_name: '',
          market: 'KOSPI',
          currency_code_id: 1,
          created_at: new Date(),
        } as StockInfo);
      } else if (groupCode === 'EF') {
        etfs.push({
          ticker,
          kor_name: korName,
          eng_name: '',
          market: 'KOSPI',
          currency_code_id: 1,
          created_at: new Date(),
        } as EtfInfo);
      } else {
        this.logger.log(`🚫 무시: ${ticker} | ${korName} | ${groupCode}`);
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

    this.logger.log('🎉 모든 데이터 처리 완료');
  }
}
