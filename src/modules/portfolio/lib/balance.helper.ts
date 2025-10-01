import { EntityManager } from 'typeorm';

export class BalanceHelper {
  /**
   * 잔고 row UPSERT
   * 존재하지 않으면 balance=0으로 생성
   * ON CONFLICT DO NOTHING: 이미 존재하면 무시
   * @param manager
   * @param portfolio_id
   * @param institution_id
   * @param currency_code_id
   */
  static async ensureBalanceRow(
    manager: EntityManager,
    portfolio_id: number,
    institution_id: number,
    currency_code_id: number,
  ): Promise<void> {
    await manager.query(
      `INSERT INTO portfolio_institution_balance (portfolio_id, institution_id, currency_code_id, balance)
            VALUES ($1, $2, $3, 0)
            ON CONFLICT (portfolio_id, institution_id, currency_code_id) DO NOTHING
            `,
      [portfolio_id, institution_id, currency_code_id],
    );
  }

  /**
   * 잔고 증가
   * @param manager
   * @param portfolio_id
   * @param institution_id
   * @param currency_code_id
   * @param amount
   * @returns
   */
  static async increaseBalance(
    manager: EntityManager,
    portfolio_id: number,
    institution_id: number,
    currency_code_id: number,
    amount: number,
  ): Promise<{ balance: number; updated_at: Date }> {
    const rows = await manager.query(
      `UPDATE portfolio_institution_balance
       SET balance = balance + $4, updated_at = NOW()
       WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
       RETURNING balance, updated_at`,
      [portfolio_id, institution_id, currency_code_id, amount],
    );
    return {
      balance: Number(rows[0]?.balance ?? 0),
      updated_at: new Date(rows[0]?.updated_at ?? Date.now()),
    };
  }

  /**
   * 잔고 감소 (음수 방지: 조건부 UPDATE)
   * @param manager
   * @param portfolio_id
   * @param institution_id
   * @param currency_code_id
   * @param amount
   * @returns
   */
  static async decreaseBalance(
    manager: EntityManager,
    portfolio_id: number,
    institution_id: number,
    currency_code_id: number,
    amount: number,
  ): Promise<{ balance: number; updated_at: Date }> {
    const rows = await manager.query(
      `UPDATE portfolio_institution_balance
       SET balance = balance - $4, updated_at = NOW()
       WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
         AND balance >= $4
       RETURNING balance, updated_at`,
      [portfolio_id, institution_id, currency_code_id, amount],
    );
    if (!rows?.length) {
      throw new Error('Insufficient balance');
    }
    return {
      balance: Number(rows[0].balance),
      updated_at: new Date(rows[0].updated_at),
    };
  }
}
