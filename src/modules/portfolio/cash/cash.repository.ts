import { Injectable } from '@nestjs/common';
import { CashTransaction } from 'src/database/entities/account/cash-transaction.entity';
import { DataSource } from 'typeorm';
import {
  GetCashBalancesParamDto,
  GetCashBalancesQueryDto,
} from '../dto/requests/cash/get-cash-balances.dto';
import {
  GetCashTransactionsParamDto,
  GetCashTransactionsQueryDto,
} from '../dto/requests/cash/get-cash-transactions.dto';
import {
  CreateCashTransactionBodyDto,
  CreateCashTransactionParamDto,
} from '../dto/requests/cash/create-cash-transaction.dto';
import {
  DeleteCashTransactionParamDto,
  DeleteCashTransactionQueryDto,
} from '../dto/requests/cash/delete-cash-transaction.dto';
import {
  UpdateCashTransactionBodyDto,
  UpdateCashTransactionParamDto,
} from '../dto/requests/cash/update-cash-transaction.dto';
import { CurrencyCode } from 'src/database/entities/code/currency-code.entity';
import { PortfolioInstitutionBalance } from 'src/database/entities/account/portfolio-institution-balance.entity';
import { BalancesSortBy } from '../dto/enum/balances-sortby.enum';
import { SortOrder } from '../dto/enum/sort-order.enum';

@Injectable()
export class CashRepository {
  constructor(private dataSource: DataSource) {}

  async getCashBalances(
    paramDto: GetCashBalancesParamDto,
    queryDto: GetCashBalancesQueryDto,
  ) {
    const { portfolio_id } = paramDto;
    const { institution_id, currency_code_id } = queryDto;

    const sortBy = queryDto.sortBy ?? BalancesSortBy.BALANCE;
    const order = (queryDto.order ?? SortOrder.DESC).toUpperCase() as
      | 'ASC'
      | 'DESC';

    const qb = this.dataSource
      .getRepository(PortfolioInstitutionBalance)
      .createQueryBuilder('pib')
      .where('pib.portfolio_id = :portfolio_id', { portfolio_id });

    qb.leftJoinAndSelect('pib.institution', 'i');
    qb.leftJoinAndSelect('pib.currency_code', 'c');

    if (institution_id) {
      qb.andWhere('pib.institution_id = :institution_id', {
        institution_id,
      });
    }

    if (currency_code_id) {
      qb.andWhere('pib.currency_code_id = :currency_code_id', {
        currency_code_id,
      });
    }

    switch (sortBy) {
      case BalancesSortBy.UPDATED_AT:
        qb.orderBy('pib.updated_at', order);
        break;
      case BalancesSortBy.INSTITUTION:
        qb.orderBy('i.display_name', order).addOrderBy('pib.id', 'DESC');
        break;
      case BalancesSortBy.BALANCE:
      default:
        qb.orderBy('pib.balance', order);
        break;
    }

    // 안정적 정렬(필요 시 공통 보조 정렬)
    if (sortBy !== BalancesSortBy.INSTITUTION) {
      qb.addOrderBy('pib.id', 'DESC');
    }

    return qb.getMany();
  }

  async getCashTransactions(
    paramDto: GetCashTransactionsParamDto,
    queryDto: GetCashTransactionsQueryDto,
  ) {
    return this.dataSource.getRepository(CashTransaction).find();
  }

  async createCashTransaction(
    paramDto: CreateCashTransactionParamDto,
    bodyDto: CreateCashTransactionBodyDto,
  ) {
    const { portfolio_id, institution_id } = paramDto;
    const { type, amount, currency_code_id, recorded_at, memo } = bodyDto;

    if (!currency_code_id || !amount || amount <= 0) {
      throw new Error('Invalid payload: amount and currency_code_id required');
    }

    // 증가/감소 판단
    const INCREASE_TYPES = new Set(['deposit', 'dividend', 'interest']);
    const DECREASE_TYPES = new Set(['withdraw', 'fee', 'tax', 'other']);

    // boolean 판단
    const isIncrease = INCREASE_TYPES.has(type);
    const isDecrease = DECREASE_TYPES.has(type);

    if (!isIncrease && !isDecrease) {
      throw new Error('Unsupported type for normal cash transaction');
    }

    const amt = Number(amount);

    return this.dataSource.transaction(async (manager) => {
      // 1) 잔고 row upsert (존재하지 않으면 balance=0으로 생성)
      // ON CONFLICE DO NOTHING: 이미 존재하면 무시
      await manager.query(
        ` INSERT INTO portfolio_institution_balance (portfolio_id, institution_id, currency_code_id, balance)
          VALUES ($1, $2, $3, 0)
          ON CONFLICT (portfolio_id, institution_id, currency_code_id) DO NOTHING
          `,
        [portfolio_id, institution_id, currency_code_id],
      );

      // 2) 잔고 증감(음수 방지: 감소 시 조건부 UPDATE)
      let balanceRow: {
        balance: string;
        currency_code_id: number;
        updated_at: string;
      } | null = null;

      if (isIncrease) {
        // 증가
        const rows = await manager.query(
          `
            UPDATE portfolio_institution_balance
            SET balance = balance + $4,
                updated_at = NOW()
            WHERE portfolio_id = $1 AND institution_id = $2 AND currency_code_id = $3
            RETURNING balance, currency_code_id, updated_at
            `,
          [portfolio_id, institution_id, currency_code_id, amt],
        );
        balanceRow = rows?.[0] ?? null;
      } else {
        // 감소
        const rows = await manager.query(
          `
            UPDATE portfolio_institution_balance
            SET balance = balance - $4,
                updated_at = NOW()
            WHERE portfolio_id = $1 AND institution_id = $2 AND currency_code_id = $3
              AND balance >= $4
            RETURNING balance, currency_code_id, updated_at
            `,
          [portfolio_id, institution_id, currency_code_id, amt],
        );
        if (!rows?.length) {
          throw new Error('Insufficient balance'); // 서비스/컨트롤러에서 400 매핑
        }
        balanceRow = rows[0];
      }

      // 3) 거래 이력 insert
      const insertResult = await manager
        .createQueryBuilder()
        .insert()
        .into(CashTransaction)
        .values({
          portfolio_id,
          institution_id,
          type, // deposit|withdraw|fee|tax|dividend|other|interest
          amount: amt.toFixed(2),
          currency_code_id,
          recorded_at: new Date(recorded_at),
          memo: memo ?? undefined,
        })
        .returning(['id'])
        .execute();

      // 3) 거래 이력 insert 결과 반환
      const txId =
        insertResult?.identifiers?.[0]?.id ??
        insertResult?.raw?.[0]?.id ??
        null;

      // currency_code 조회
      const currency_code = await manager.findOne(CurrencyCode, {
        where: { id: currency_code_id },
      });

      // balance 조회
      const balance = await manager.findOne(PortfolioInstitutionBalance, {
        where: { portfolio_id, institution_id, currency_code_id },
      });

      // 4) 결과 반환(레포 반환 형태는 서비스에서 DTO로 래핑해 사용)
      return {
        transaction: {
          id: txId,
          type,
          amount: amt,
          currency_code_id,
          currency_code: currency_code?.currency_code ?? '',
          recorded_at: new Date(recorded_at).toISOString(),
          memo: memo ?? null,
        },
        balance_after: {
          currency_code_id,
          balance: Number(balance?.balance ?? 0),
          updated_at: new Date(
            balanceRow?.updated_at ?? Date.now(),
          ).toISOString(),
        },
      };
    });
  }

  async createExchangeTransaction(
    paramDto: CreateCashTransactionParamDto,
    bodyDto: CreateCashTransactionBodyDto,
  ) {
    const { portfolio_id, institution_id } = paramDto;
    const {
      from_currency_id,
      to_currency_id,
      from_amount,
      rate,
      to_amount,
      recorded_at,
      memo,
    } = bodyDto;

    // 필수값 검증
    if (
      !from_currency_id ||
      !to_currency_id ||
      !from_amount ||
      !to_amount ||
      !rate
    ) {
      throw new Error('Invalid exchange payload');
    }

    if (from_currency_id === to_currency_id) {
      throw new Error('Invalid exchange pair');
    }

    const fromAmt = Number(from_amount);
    const rateVal = Number(rate);
    const toAmt = Number(to_amount);

    if (!(fromAmt > 0) || !(rateVal > 0) || !(toAmt > 0)) {
      throw new Error('Invalid exchange amounts');
    }

    const BASE_CURRENCY_ID = 1; // 기준통화(KRW)

    // to_amount 검증: 기준통화(KRW=1) 기준으로 방향에 따라 산식이 다름
    // - 기준→외화(KRW→USD): expectedTo = round(from_amount / rate, 2)
    // - 외화→기준(USD→KRW): expectedTo = round(from_amount * rate, 2)
    let expectedTo: number;
    if (
      from_currency_id === BASE_CURRENCY_ID &&
      to_currency_id !== BASE_CURRENCY_ID
    ) {
      expectedTo = Math.round((fromAmt / rateVal) * 100) / 100;
    } else if (
      from_currency_id !== BASE_CURRENCY_ID &&
      to_currency_id === BASE_CURRENCY_ID
    ) {
      expectedTo = Math.round(fromAmt * rateVal * 100) / 100;
    } else {
      throw new Error('Only base↔foreign exchanges supported');
    }
    if (Math.abs(expectedTo - toAmt) > 0.01) {
      throw new Error('Exchange amounts do not match rate');
    }

    const exchangeGroupId = 'EX-' + Date.now();

    return this.dataSource.transaction(async (manager) => {
      // 잔고 row upsert 두 통화
      await manager.query(
        `INSERT INTO portfolio_institution_balance (portfolio_id, institution_id, currency_code_id, balance)
         VALUES ($1,$2,$3,0)
         ON CONFLICT (portfolio_id, institution_id, currency_code_id) DO NOTHING`,
        [portfolio_id, institution_id, from_currency_id],
      );
      await manager.query(
        `INSERT INTO portfolio_institution_balance (portfolio_id, institution_id, currency_code_id, balance)
         VALUES ($1,$2,$3,0)
         ON CONFLICT (portfolio_id, institution_id, currency_code_id) DO NOTHING`,
        [portfolio_id, institution_id, to_currency_id],
      );

      // 평균 환율 갱신을 위해 대상 외화 row 선조회(락)
      let prevQty = 0;
      let prevAvg = 0;
      // 기준→외화 환전인 경우(to가 외화)만 평균 환율 갱신 대상
      if (
        from_currency_id === BASE_CURRENCY_ID &&
        to_currency_id !== BASE_CURRENCY_ID
      ) {
        const rows = await manager.query(
          `SELECT balance, avg_rate FROM portfolio_institution_balance
           WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
           FOR UPDATE`,
          [portfolio_id, institution_id, to_currency_id],
        );
        prevQty = Number(rows?.[0]?.balance ?? 0);
        prevAvg = Number(rows?.[0]?.avg_rate ?? 0);
      }

      // from 감소 (음수 방지)
      const dec = await manager.query(
        `UPDATE portfolio_institution_balance
        SET balance = balance - $4, updated_at = NOW()
        WHERE portfolio_id = $1 AND institution_id = $2 AND currency_code_id = $3
        AND balance >= $4
        RETURNING balance, currency_code_id, updated_at`,
        [portfolio_id, institution_id, from_currency_id, fromAmt],
      );
      if (!dec?.length) {
        throw new Error('Insufficient balance');
      }

      // to 증가
      const inc = await manager.query(
        `UPDATE portfolio_institution_balance
         SET balance = balance + $4, updated_at = NOW()
         WHERE portfolio_id = $1 AND institution_id = $2 AND currency_code_id = $3
         RETURNING balance, currency_code_id, updated_at`,
        [portfolio_id, institution_id, to_currency_id, toAmt],
      );

      // 평균환율 갱신
      if (
        from_currency_id === BASE_CURRENCY_ID &&
        to_currency_id !== BASE_CURRENCY_ID
      ) {
        const newQty = prevQty + toAmt;
        const newAvg =
          newQty > 0 ? (prevQty * prevAvg + toAmt * rateVal) / newQty : 0;
        await manager.query(
          `UPDATE portfolio_institution_balance
           SET avg_rate = $4
           WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3`,
          [portfolio_id, institution_id, to_currency_id, newAvg],
        );
      }
      if (
        from_currency_id !== BASE_CURRENCY_ID &&
        to_currency_id === BASE_CURRENCY_ID
      ) {
        // 외화→기준 환전: 외화 qty 감소 후 0이면 avg_rate NULL로 리셋
        const rows = await manager.query(
          `SELECT balance FROM portfolio_institution_balance
           WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
           FOR UPDATE`,
          [portfolio_id, institution_id, from_currency_id],
        );
        const curQty = Number(rows?.[0]?.balance ?? 0);
        if (curQty === 0) {
          await manager.query(
            `UPDATE portfolio_institution_balance
             SET avg_rate = NULL
             WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3`,
            [portfolio_id, institution_id, from_currency_id],
          );
        }
      }

      // 거래 2건 insert (out/in)
      const outRes = await manager
        .createQueryBuilder()
        .insert()
        .into(CashTransaction)
        .values({
          portfolio_id,
          institution_id,
          type: 'exchange_out',
          amount: fromAmt.toFixed(2),
          currency_code_id: from_currency_id,
          recorded_at: new Date(recorded_at),
          memo: memo ?? undefined,
          rate: rateVal,
          exchange_group_id: exchangeGroupId,
        })
        .returning(['id'])
        .execute();

      const inRes = await manager
        .createQueryBuilder()
        .insert()
        .into(CashTransaction)
        .values({
          portfolio_id,
          institution_id,
          type: 'exchange_in',
          amount: toAmt.toFixed(2),
          currency_code_id: to_currency_id,
          recorded_at: new Date(recorded_at),
          memo: memo ?? undefined,
          rate: rateVal,
          exchange_group_id: exchangeGroupId,
        })
        .returning(['id'])
        .execute();

      return {
        exchange_group_id: exchangeGroupId,
        transactions: [
          {
            id: outRes.identifiers[0]?.id,
            type: 'exchange_out',
            amount: fromAmt,
            currency_code_id: from_currency_id,
            recorded_at: new Date(recorded_at).toISOString(),
            memo: memo ?? null,
            rate: rateVal,
          },
          {
            id: inRes.identifiers[0]?.id,
            type: 'exchange_in',
            amount: toAmt,
            currency_code_id: to_currency_id,
            recorded_at: new Date(recorded_at).toISOString(),
            memo: memo ?? null,
            rate: rateVal,
          },
        ],
        balances_after: [
          {
            currency_code_id: from_currency_id,
            balance: Number(dec[0]?.balance ?? 0),
            updated_at: new Date(
              dec[0]?.updated_at ?? Date.now(),
            ).toISOString(),
          },
          {
            currency_code_id: to_currency_id,
            balance: Number(inc[0]?.balance ?? 0),
            updated_at: new Date(
              inc[0]?.updated_at ?? Date.now(),
            ).toISOString(),
          },
        ],
      };
    });
  }

  async deleteCashTransaction(
    paramDto: DeleteCashTransactionParamDto,
    queryDto: DeleteCashTransactionQueryDto,
  ) {
    return this.dataSource.getRepository(CashTransaction).find();
  }

  async deleteCashTransactionGroup(queryDto: DeleteCashTransactionQueryDto) {
    return this.dataSource.getRepository(CashTransaction).find();
  }

  async updateCashTransaction(
    paramDto: UpdateCashTransactionParamDto,
    bodyDto: UpdateCashTransactionBodyDto,
  ) {
    return this.dataSource.getRepository(CashTransaction).find();
  }
}
