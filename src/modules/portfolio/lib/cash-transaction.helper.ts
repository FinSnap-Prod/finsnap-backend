import { EntityManager } from 'typeorm';
import { BalanceHelper } from './balance.helper';
import { CashTransaction } from 'src/database/entities/account/cash-transaction.entity';

export class CashTransactionHelper {
  /**
   * 예수금 거래내역 생성
   * @param manager EntityManager
   * @param params
   */
  static async createLinkedTransaction(
    manager: EntityManager,
    params: {
      portfolio_id: number;
      institution_id: number;
      currency_code_id: number;
      effectType: 'buy' | 'sell';
      amount: number;
      recorded_at: Date;
      memo?: string;
      asset_history_id: number;
      user_asset_id: number;
    },
  ): Promise<void> {
    const {
      portfolio_id,
      institution_id,
      currency_code_id,
      effectType,
      amount,
      recorded_at,
      memo,
      asset_history_id,
      user_asset_id,
    } = params;

    await BalanceHelper.ensureBalanceRow(
      manager,
      portfolio_id,
      institution_id,
      currency_code_id,
    );

    if (effectType === 'buy') {
      await BalanceHelper.decreaseBalance(
        manager,
        portfolio_id,
        institution_id,
        currency_code_id,
        amount,
      );
    } else {
      await BalanceHelper.increaseBalance(
        manager,
        portfolio_id,
        institution_id,
        currency_code_id,
        amount,
      );
    }

    await manager
      .createQueryBuilder()
      .insert()
      .into(CashTransaction)
      .values({
        portfolio_id,
        institution_id,
        type: effectType,
        amount: amount.toFixed(2),
        currency_code_id,
        recorded_at,
        memo,
        asset_history_id,
        user_asset_id,
      })
      .execute();
  }
}
