import { CryptoInfo } from 'src/database/entities/crypto/crypto-info.entity';
import { CryptoMarketData } from 'src/database/entities/crypto/crypto-market-data.entity';
import { EtfInfo } from 'src/database/entities/etf/etf-info.entity';
import { EtfMarketData } from 'src/database/entities/etf/etf-market-data.entity';
import { StockInfo } from 'src/database/entities/stock/stock-info.entity';
import { StockMarketData } from 'src/database/entities/stock/stock-market-data.entity';
import { EntityManager } from 'typeorm';

export class AssetInfoHelper {
  /**
   * AssetInfo에서 실제 자산 이름 조회
   * @param manager
   * @param assetTypeId 1: stock, 2: etf, 3: crypto
   * @param assetInfoId
   * @returns
   */
  static async getAssetName(
    manager: EntityManager,
    assetTypeId: number,
    assetInfoId: number,
  ): Promise<string> {
    switch (assetTypeId) {
      case 1: {
        const i = await manager.findOne(StockInfo, {
          where: { id: assetInfoId },
          select: ['kor_name', 'eng_name'],
        });
        return i?.kor_name || i?.eng_name || '';
      }
      case 2: {
        const i = await manager.findOne(EtfInfo, {
          where: { id: assetInfoId },
          select: ['kor_name', 'eng_name'],
        });
        return i?.kor_name || i?.eng_name || '';
      }
      case 3: {
        const i = await manager.findOne(CryptoInfo, {
          where: { id: assetInfoId },
          select: ['kor_name', 'eng_name'],
        });
        return i?.kor_name || i?.eng_name || '';
      }
      default: {
        return '';
      }
    }
  }

  /**
   * AssetInfo에서 실제 자산 이름과 시장 가격 조회
   * @param manager
   * @param assetTypeId 1: stock, 2: etf, 3: crypto
   * @param assetInfoId
   * @returns
   */
  static async getAssetWithMarketPrice(
    manager: EntityManager,
    assetTypeId: number,
    assetInfoId: number,
  ): Promise<{ name: string; marketPrice?: number }> {
    switch (assetTypeId) {
      case 1: {
        const name = await this.getAssetName(manager, assetTypeId, assetInfoId);
        const md = await manager.findOne(StockMarketData, {
          where: { stock_info_id: assetInfoId },
          select: ['price'],
        });
        return { name, marketPrice: md ? Number(md.price) : undefined };
      }
      case 2: {
        const name = await this.getAssetName(manager, assetTypeId, assetInfoId);
        const md = await manager.findOne(EtfMarketData, {
          where: { etf_info_id: assetInfoId },
          select: ['price'],
        });
        return { name, marketPrice: md ? Number(md.price) : undefined };
      }
      case 3: {
        const name = await this.getAssetName(manager, assetTypeId, assetInfoId);
        const md = await manager.findOne(CryptoMarketData, {
          where: { crypto_info_id: assetInfoId },
          select: ['price'],
        });
        return { name, marketPrice: md ? Number(md.price) : undefined };
      }
      default: {
        return { name: '', marketPrice: undefined };
      }
    }
  }
}
