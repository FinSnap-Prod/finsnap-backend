import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { StockInfo } from '../../entities/stock/stock-info.entity';
import { EtfInfo } from '../../entities/etf/etf-info.entity';
import { Repository } from 'typeorm';
import * as https from 'https';
import * as unzipper from 'unzipper';
import * as iconv from 'iconv-lite';

@Injectable()
export class OverseasMasterService {
  private readonly logger = new Logger(OverseasMasterService.name);
  private readonly workDir = path.join(process.cwd(), 'overseas_master');
  private readonly markets = ['nas', 'nys', 'ams'];

  constructor(
    @InjectRepository(StockInfo)
    private readonly stockRepo: Repository<StockInfo>,
    @InjectRepository(EtfInfo)
    private readonly etfRepo: Repository<EtfInfo>,
  ) {}

  async run(): Promise<void> {
    if (!fs.existsSync(this.workDir)) fs.mkdirSync(this.workDir);
    for (const code of this.markets) {
      const zipUrl = `https://new.real.download.dws.co.kr/common/master/${code}mst.cod.zip`;
      const zipPath = path.join(this.workDir, `${code}.zip`);
      const codPath = path.join(this.workDir, `${code}mst.cod`);
      await this.download(zipUrl, zipPath);
      await fs
        .createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: this.workDir }))
        .promise();
      await this.parseAndUpsert(codPath);
      fs.unlinkSync(zipPath);
      fs.unlinkSync(codPath);
    }
    this.logger.log('Done');
  }

  private download(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          if (res.statusCode !== 200) return reject();
          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        })
        .on('error', reject);
    });
  }

  private async parseAndUpsert(file: string) {
    const fileBuffer = fs.readFileSync(file);
    const decoded = iconv.decode(fileBuffer, 'cp949');
    const lines = decoded.split('\n');
    const stocks: StockInfo[] = [];
    const etfs: EtfInfo[] = [];
    for (let i = 1; i < lines.length; i++) {
      // 1번째 줄은 header
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split('\t');
      if (cols.length < 9) continue;
      const [exchangeName, symbol, kor, eng, type] = [
        cols[3],
        cols[4],
        cols[6],
        cols[7],
        cols[8],
      ];
      if (type === '2')
        stocks.push({
          ticker: symbol,
          kor_name: kor,
          eng_name: eng,
          market: exchangeName,
          currency_code_id: 1,
          created_at: new Date(),
        } as StockInfo);
      if (type === '3')
        etfs.push({
          ticker: symbol,
          kor_name: kor,
          eng_name: eng,
          market: exchangeName,
          currency_code_id: 1,
          created_at: new Date(),
        } as EtfInfo);
    }
    if (stocks.length) await this.stockRepo.upsert(stocks, ['ticker']);
    if (etfs.length) await this.etfRepo.upsert(etfs, ['ticker']);
  }
}
