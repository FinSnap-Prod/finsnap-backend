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
  DeleteExchangeCashTransactionParamDto,
  DeleteExchangeCashTransactionQueryDto,
} from '../dto/requests/cash/delete-cash-transaction.dto';
import {
  UpdateCashTransactionBodyDto,
  UpdateCashTransactionParamDto,
  UpdateExchangeCashTransactionBodyDto,
  UpdateExchangeCashTransactionParamDto,
  UpdateExchangeCashTransactionQueryDto,
} from '../dto/requests/cash/update-cash-transaction.dto';
import { CurrencyCode } from 'src/database/entities/code/currency-code.entity';
import { PortfolioInstitutionBalance } from 'src/database/entities/account/portfolio-institution-balance.entity';
import { BalancesSortBy } from '../dto/enum/balances-sortby.enum';
import { SortOrder } from '../dto/enum/sort-order.enum';
import { CashSortBy } from '../dto/enum/cash-sortby.enum';

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
    const { portfolio_id, institution_id } = paramDto;

    const pageNumber = Math.max(1, Number(queryDto.page) || 1);
    const limitNumber = Math.min(100, Number(queryDto.limit) || 20);
    const skip = (pageNumber - 1) * limitNumber;

    const sortBy = queryDto.sortBy ?? CashSortBy.RECORDED_AT;
    const order = (queryDto.order ?? SortOrder.DESC).toUpperCase() as
      | 'ASC'
      | 'DESC';

    const qb = this.dataSource
      .getRepository(CashTransaction)
      .createQueryBuilder('ct')
      .leftJoinAndSelect('ct.institution', 'i')
      .leftJoinAndSelect('ct.currency_code', 'c')
      .where('ct.portfolio_id = :portfolio_id', { portfolio_id });

    this.applyTxFilters(qb, {
      institution_id,
      currency_code_id: queryDto.currency_code_id,
      from: queryDto.from,
      to: queryDto.to,
      type: queryDto.type,
    });

    const sortColumn =
      sortBy === CashSortBy.AMOUNT ? 'ct.amount' : 'ct.recorded_at';

    qb.orderBy(sortColumn, order).addOrderBy('ct.id', 'DESC');

    // 페이지네이션 적용
    qb.skip(skip).take(limitNumber);

    // 총 거래내역 수 조회, clone(): 원본 쿼리빌더 복제 , orderBy(): 정렬 조건 제거, skip(undefined).take(undefined): 페이지네이션 제거,
    const countQb = qb.clone().orderBy().skip(undefined).take(undefined);

    // 거래내역 조회, getMany(): 페이지네이션 적용, getCount(): 총 거래내역 수 조회
    const [transactions, totalCount] = await Promise.all([
      qb.getMany(),
      countQb.getCount(),
    ]);

    return {
      items: transactions,
      pagination: totalCount,
    };
  }

  // 내부 헬퍼: 필터 공통 적용
  private applyTxFilters(
    qb: import('typeorm').SelectQueryBuilder<CashTransaction>,
    opts: {
      institution_id?: number;
      currency_code_id?: number;
      from?: string;
      to?: string;
      type?: string;
    },
  ) {
    const { institution_id, currency_code_id, from, to, type } = opts;

    if (institution_id) {
      qb.andWhere('ct.institution_id = :institution_id', { institution_id });
    }
    if (currency_code_id) {
      qb.andWhere('ct.currency_code_id = :currency_code_id', {
        currency_code_id,
      });
    }
    if (from) {
      qb.andWhere('ct.recorded_at >= :from', { from: new Date(from) });
    }
    if (to) {
      qb.andWhere('ct.recorded_at <= :to', { to: new Date(to) });
    }
    if (type) {
      if (type === 'exchange') {
        qb.andWhere('ct.type IN (:...exTypes)', {
          exTypes: ['exchange_out', 'exchange_in'],
        });
      } else {
        qb.andWhere('ct.type = :type', { type });
      }
    }
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

  async deleteCashTransaction(paramDto: DeleteCashTransactionParamDto) {
    const { portfolio_id, institution_id, id } = paramDto;

    return this.dataSource.transaction(async (manager) => {
      // 1. 삭제할 거래 내역 조회 및 검증
      const tx = await manager.findOne(CashTransaction, {
        where: { id, portfolio_id, institution_id },
      });
      if (!tx) throw new Error('Transaction not found');

      // 환전 거래는 그룹 삭제로만 가능
      if (tx.exchange_group_id) {
        throw new Error('Exchange transaction requires group deletion');
      }

      // 자산내역 연동 거래는 삭제 불가 (T8 Guard)
      if (tx.asset_history_id) {
        throw new Error('Linked asset transaction cannot be deleted');
      }

      const amt = Number(tx.amount);
      const curId = tx.currency_code_id;

      // 2. 잔액 테이블에 해당 통화 레코드가 없으면 생성 (잔액 0으로)
      await manager.query(
        `INSERT INTO portfolio_institution_balance (portfolio_id, institution_id, currency_code_id, balance)
         VALUES ($1,$2,$3,0)
         ON CONFLICT (portfolio_id, institution_id, currency_code_id) DO NOTHING`,
        [portfolio_id, institution_id, curId],
      );

      // 3. 거래 타입별 잔액 조정 로직
      const INCREASE = new Set(['deposit', 'dividend', 'interest']); // 입금류: 삭제 시 잔액 감소
      const DECREASE = new Set(['withdraw', 'fee', 'tax', 'other']); // 출금류: 삭제 시 잔액 증가

      if (INCREASE.has(tx.type)) {
        // 입금류 거래 삭제: 잔액에서 해당 금액 차감 (잔액 부족 시 에러)
        const rows = await manager.query(
          `UPDATE portfolio_institution_balance
             SET balance = balance - $4, updated_at = NOW()
           WHERE portfolio_id = $1 AND institution_id = $2 AND currency_code_id = $3
             AND balance >= $4
           RETURNING balance, updated_at`,
          [portfolio_id, institution_id, curId, amt],
        );
        if (!rows?.length) throw new Error('Insufficient balance');
      } else if (DECREASE.has(tx.type)) {
        // 출금류 거래 삭제: 잔액에 해당 금액 추가
        await manager.query(
          `UPDATE portfolio_institution_balance
             SET balance = balance + $4, updated_at = NOW()
           WHERE portfolio_id = $1 AND institution_id = $2 AND currency_code_id = $3`,
          [portfolio_id, institution_id, curId, amt],
        );
      } else {
        throw new Error('Unsupported type');
      }

      // 4. 거래 내역 삭제
      await manager.delete(CashTransaction, { id });

      // 5. 삭제 후 최종 잔액 조회하여 반환
      const balance = await manager.findOne(PortfolioInstitutionBalance, {
        where: { portfolio_id, institution_id, currency_code_id: curId },
        relations: ['currency_code'],
      });

      return { balance };
    });
  }

  async deleteCashTransactionGroup(
    paramDto: DeleteExchangeCashTransactionParamDto,
    queryDto: DeleteExchangeCashTransactionQueryDto,
  ) {
    const { portfolio_id, institution_id } = paramDto;
    const { exchange_group_id } = queryDto;

    return this.dataSource.transaction(async (manager) => {
      // 1) 그룹 내 거래 조회 (같은 포트폴리오/기관/그룹)
      const txs = await manager.find(CashTransaction, {
        where: { portfolio_id, institution_id, exchange_group_id },
      });
      if (!txs?.length) throw new Error('Transactions not found');

      // 2) 관련 통화 balance row upsert
      const currencyIds = Array.from(
        new Set(txs.map((t) => t.currency_code_id)),
      );
      for (const curId of currencyIds) {
        await manager.query(
          `INSERT INTO portfolio_institution_balance (portfolio_id, institution_id, currency_code_id, balance)
           VALUES ($1,$2,$3,0)
           ON CONFLICT (portfolio_id, institution_id, currency_code_id) DO NOTHING`,
          [portfolio_id, institution_id, curId],
        );
      }

      // 3) 잔액 되돌림
      // - exchange_out 삭제: balance += amount
      // - exchange_in 삭제: balance -= amount (AND balance >= amount)
      for (const tx of txs) {
        const amt = Number(tx.amount);
        if (tx.type === 'exchange_out') {
          await manager.query(
            `UPDATE portfolio_institution_balance
             SET balance = balance + $4, updated_at = NOW()
             WHERE portfolio_id = $1 AND institution_id = $2 AND currency_code_id = $3`,
            [portfolio_id, institution_id, tx.currency_code_id, amt],
          );
        } else if (tx.type === 'exchange_in') {
          const rows = await manager.query(
            `UPDATE portfolio_institution_balance
             SET balance = balance - $4, updated_at = NOW()
             WHERE portfolio_id = $1 AND institution_id = $2 AND currency_code_id = $3
               AND balance >= $4
             RETURNING balance, updated_at`,
            [portfolio_id, institution_id, tx.currency_code_id, amt],
          );
          if (!rows?.length) throw new Error('Insufficient balance');
        }
      }

      // 4) 거래 삭제 (그룹 기준)
      await manager.delete(CashTransaction, { exchange_group_id });

      // 5) 삭제 후 잔액 조회(각 통화)
      const balances_after = [] as {
        currency_code_id: number;
        currency_code?: string;
        balance: number;
        updated_at: string;
      }[];
      for (const curId of currencyIds) {
        const b = await manager.findOne(PortfolioInstitutionBalance, {
          where: { portfolio_id, institution_id, currency_code_id: curId },
          relations: ['currency_code'],
        });
        balances_after.push({
          currency_code_id: curId,
          currency_code: b?.currency_code?.currency_code ?? '',
          balance: Number(b?.balance ?? 0),
          updated_at: new Date(b?.updated_at ?? Date.now()).toISOString(),
        });
      }

      return {
        deleted_transaction_ids: txs.map((t) => t.id),
        balances_after,
      };
    });
  }

  async updateCashTransaction(
    paramDto: UpdateCashTransactionParamDto,
    bodyDto: UpdateCashTransactionBodyDto,
  ) {
    const { portfolio_id, institution_id, id } = paramDto;

    return this.dataSource.transaction(async (manager) => {
      // 0) 기존 거래 조회
      const tx = await manager.findOne(CashTransaction, {
        where: { id, portfolio_id, institution_id },
      });
      if (!tx) throw new Error('Transaction not found');
      if (tx.exchange_group_id) {
        throw new Error('Exchange transaction requires group update');
      }

      // 1) 새 값 확정
      const oldType = tx.type;
      const oldAmt = Number(tx.amount);
      const oldCur = tx.currency_code_id;

      const newType = bodyDto.type ?? oldType;
      const newAmt = Number(bodyDto.amount ?? oldAmt);
      const newCur = Number(bodyDto.currency_code_id ?? oldCur);
      const newRecordedAt = bodyDto.recorded_at
        ? new Date(bodyDto.recorded_at)
        : tx.recorded_at;
      const newMemo = bodyDto.memo ?? tx.memo;

      if (!(newAmt > 0)) throw new Error('Invalid payload');

      const INCREASE = new Set(['deposit', 'dividend', 'interest']);
      const DECREASE = new Set(['withdraw', 'fee', 'tax', 'other']);

      if (!INCREASE.has(newType) && !DECREASE.has(newType)) {
        throw new Error('Unsupported type');
      }

      // 2) 잔고 row 보장(기존/신규 통화 모두)
      await manager.query(
        `INSERT INTO portfolio_institution_balance (portfolio_id, institution_id, currency_code_id, balance)
       VALUES ($1,$2,$3,0)
       ON CONFLICT (portfolio_id, institution_id, currency_code_id) DO NOTHING`,
        [portfolio_id, institution_id, oldCur],
      );
      await manager.query(
        `INSERT INTO portfolio_institution_balance (portfolio_id, institution_id, currency_code_id, balance)
       VALUES ($1,$2,$3,0)
       ON CONFLICT (portfolio_id, institution_id, currency_code_id) DO NOTHING`,
        [portfolio_id, institution_id, newCur],
      );

      // 3) 기존 효과 롤백
      if (INCREASE.has(oldType)) {
        const rows = await manager.query(
          `UPDATE portfolio_institution_balance
           SET balance = balance - $4, updated_at = NOW()
         WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
           AND balance >= $4
         RETURNING id`,
          [portfolio_id, institution_id, oldCur, oldAmt],
        );
        if (!rows?.length) throw new Error('Insufficient balance');
      } else if (DECREASE.has(oldType)) {
        await manager.query(
          `UPDATE portfolio_institution_balance
           SET balance = balance + $4, updated_at = NOW()
         WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3`,
          [portfolio_id, institution_id, oldCur, oldAmt],
        );
      } else {
        throw new Error('Unsupported type');
      }

      // 4) 새로운 효과 적용
      if (INCREASE.has(newType)) {
        await manager.query(
          `UPDATE portfolio_institution_balance
       SET balance = balance + $4, updated_at = NOW()
     WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3`,
          [portfolio_id, institution_id, newCur, newAmt],
        );
      } else if (DECREASE.has(newType)) {
        const rows = await manager.query(
          `UPDATE portfolio_institution_balance
       SET balance = balance - $4, updated_at = NOW()
     WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
       AND balance >= $4
     RETURNING id`,
          [portfolio_id, institution_id, newCur, newAmt],
        );
        if (!rows?.length) throw new Error('Insufficient balance');
      }

      // 5) 거래내역 업데이트
      await manager.update(
        CashTransaction,
        { id },
        {
          type: newType,
          amount: newAmt.toFixed(2),
          currency_code_id: newCur,
          recorded_at: newRecordedAt,
          memo: newMemo ?? undefined,
        },
      );

      // 6) 수정 후 최종 잔액 조회하여 반환
      const balance = await manager.findOne(PortfolioInstitutionBalance, {
        where: { portfolio_id, institution_id, currency_code_id: newCur },
        relations: ['currency_code'],
      });

      return {
        updated: {
          id,
          type: newType,
          amount: newAmt,
          currency_code_id: newCur,
          currency_code: balance?.currency_code?.currency_code ?? '',
          recorded_at: newRecordedAt.toISOString(),
          memo: newMemo ?? undefined,
        },
        balance_after: {
          currency_code_id: newCur,
          currency_code: balance?.currency_code?.currency_code ?? '',
          balance: Number(balance?.balance ?? 0),
          updated_at: new Date(balance?.updated_at ?? Date.now()).toISOString(),
        },
      };
    });
  }

  async updateCashTransactionGroup(
    paramDto: UpdateExchangeCashTransactionParamDto,
    bodyDto: UpdateExchangeCashTransactionBodyDto,
    queryDto: UpdateExchangeCashTransactionQueryDto,
  ) {
    const { portfolio_id, institution_id } = paramDto;
    const { exchange_group_id } = queryDto;

    return this.dataSource.transaction(async (manager) => {
      if (!exchange_group_id) {
        throw new Error('Invalid payload');
      }

      // 1) 기존 그룹 조회 + 무결성 검사(반드시 in/out 2건)
      const existing = await manager.find(CashTransaction, {
        where: { portfolio_id, institution_id, exchange_group_id },
      });
      if (!existing?.length) throw new Error('Transactions not found');
      const hasOut = existing.some((t) => t.type === 'exchange_out');
      const hasIn = existing.some((t) => t.type === 'exchange_in');
      if (!(hasOut && hasIn) || existing.length !== 2) {
        throw new Error('Inconsistent exchange group state');
      }

      // 2) 관련 통화 잔고 row 보장 (기존 그룹 통화들)
      const prevCurrencyIds = Array.from(
        new Set(existing.map((t) => t.currency_code_id)),
      );
      for (const curId of prevCurrencyIds) {
        await manager.query(
          `INSERT INTO portfolio_institution_balance (portfolio_id, institution_id, currency_code_id, balance)
           VALUES ($1,$2,$3,0)
           ON CONFLICT (portfolio_id, institution_id, currency_code_id) DO NOTHING`,
          [portfolio_id, institution_id, curId],
        );
      }

      // 3) 기존 효과 되돌리기
      for (const tx of existing) {
        const amt = Number(tx.amount);
        if (tx.type === 'exchange_out') {
          // out 삭제 → 잔고 가산
          await manager.query(
            `UPDATE portfolio_institution_balance
             SET balance = balance + $4, updated_at = NOW()
             WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3`,
            [portfolio_id, institution_id, tx.currency_code_id, amt],
          );
        } else if (tx.type === 'exchange_in') {
          // in 삭제 → 잔고 감산(가드)
          const rows = await manager.query(
            `UPDATE portfolio_institution_balance
             SET balance = balance - $4, updated_at = NOW()
             WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
               AND balance >= $4
             RETURNING id`,
            [portfolio_id, institution_id, tx.currency_code_id, amt],
          );
          if (!rows?.length) throw new Error('Insufficient balance');
        }
      }

      // 4) 기존 거래 삭제
      await manager.delete(CashTransaction, { exchange_group_id });

      // 5) 입력 검증 및 to_amount 계산
      const {
        from_currency_id,
        to_currency_id,
        from_amount,
        rate,
        to_amount,
        recorded_at,
        memo,
      } = bodyDto;

      if (
        !from_currency_id ||
        !to_currency_id ||
        !from_amount ||
        (!rate && !to_amount)
      ) {
        throw new Error('Invalid payload');
      }
      if (from_currency_id === to_currency_id) {
        throw new Error('Invalid exchange pair');
      }

      const BASE_CURRENCY_ID = 1; // 기준통화(KRW)
      const fromAmt = Number(from_amount);
      const rateVal = rate ? Number(rate) : undefined;
      let toAmt = to_amount ? Number(to_amount) : undefined;
      if (!(fromAmt > 0)) throw new Error('Invalid exchange amounts');
      if (rateVal !== undefined && !(rateVal > 0))
        throw new Error('Invalid exchange amounts');
      if (toAmt !== undefined && !(toAmt > 0))
        throw new Error('Invalid exchange amounts');

      // 계산/검증: 기준↔외화만 허용
      if (
        !(
          (from_currency_id === BASE_CURRENCY_ID &&
            to_currency_id !== BASE_CURRENCY_ID) ||
          (from_currency_id !== BASE_CURRENCY_ID &&
            to_currency_id === BASE_CURRENCY_ID)
        )
      ) {
        throw new Error('Only base↔foreign exchanges supported');
      }

      if (toAmt === undefined && rateVal !== undefined) {
        // 계산
        if (
          from_currency_id === BASE_CURRENCY_ID &&
          to_currency_id !== BASE_CURRENCY_ID
        ) {
          toAmt = Math.round((fromAmt / rateVal) * 100) / 100;
        } else {
          toAmt = Math.round(fromAmt * rateVal * 100) / 100;
        }
      }

      if (rateVal !== undefined && toAmt !== undefined) {
        const expected =
          from_currency_id === BASE_CURRENCY_ID
            ? Math.round((fromAmt / rateVal) * 100) / 100
            : Math.round(fromAmt * rateVal * 100) / 100;
        if (Math.abs(expected - toAmt) > 0.01) {
          throw new Error('Exchange amounts do not match rate');
        }
      }

      // 타입 확정
      const newOut = {
        currency_id: from_currency_id,
        amount: fromAmt,
      };
      const newIn = {
        currency_id: to_currency_id,
        amount: toAmt as number,
      };

      // 6) 잔고 row 보장 (새 통화들)
      const newCurrencyIds = Array.from(
        new Set([from_currency_id, to_currency_id]),
      );
      for (const curId of newCurrencyIds) {
        await manager.query(
          `INSERT INTO portfolio_institution_balance (portfolio_id, institution_id, currency_code_id, balance)
           VALUES ($1,$2,$3,0)
           ON CONFLICT (portfolio_id, institution_id, currency_code_id) DO NOTHING`,
          [portfolio_id, institution_id, curId],
        );
      }

      // 7) 평균환율 갱신을 위해 대상 외화 row 선조회(락)
      let prevQty = 0;
      let prevAvg = 0;
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

      // 8) 사전 잔고 확인(from 통화)
      const fromBal = await manager.query(
        `SELECT balance FROM portfolio_institution_balance
         WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
         FOR UPDATE`,
        [portfolio_id, institution_id, newOut.currency_id],
      );
      if (Number(fromBal?.[0]?.balance ?? 0) < (newOut.amount as number)) {
        throw new Error('Insufficient balance');
      }

      // 9) 새 효과 적용: from 감소(가드) + to 증가
      const decRows = await manager.query(
        `UPDATE portfolio_institution_balance
         SET balance = balance - $4, updated_at = NOW()
         WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
           AND balance >= $4
         RETURNING balance, updated_at`,
        [portfolio_id, institution_id, newOut.currency_id, newOut.amount],
      );
      if (!decRows?.length) throw new Error('Insufficient balance');

      await manager.query(
        `UPDATE portfolio_institution_balance
         SET balance = balance + $4, updated_at = NOW()
         WHERE portfolio_id=$1 AND institution_id=$2 AND currency_code_id=$3
         `,
        [portfolio_id, institution_id, newIn.currency_id, newIn.amount],
      );

      // 10) 평균환율 갱신
      if (
        from_currency_id === BASE_CURRENCY_ID &&
        to_currency_id !== BASE_CURRENCY_ID &&
        rateVal !== undefined
      ) {
        const newQty = prevQty + (newIn.amount as number);
        const newAvg =
          newQty > 0
            ? (prevQty * prevAvg + (newIn.amount as number) * rateVal) / newQty
            : 0;
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

      // 11) 거래 2건 재삽입 (같은 exchange_group_id 재사용)
      const outRes = await manager
        .createQueryBuilder()
        .insert()
        .into(CashTransaction)
        .values({
          portfolio_id,
          institution_id,
          type: 'exchange_out',
          amount: (newOut.amount as number).toFixed(2),
          currency_code_id: newOut.currency_id,
          recorded_at: new Date(recorded_at),
          memo: memo ?? undefined,
          rate: rateVal ?? undefined,
          exchange_group_id,
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
          amount: (newIn.amount as number).toFixed(2),
          currency_code_id: newIn.currency_id,
          recorded_at: new Date(recorded_at),
          memo: memo ?? undefined,
          rate: rateVal ?? undefined,
          exchange_group_id,
        })
        .returning(['id'])
        .execute();

      // 12) balance_after(관례상 to_currency에 대한 잔고 반환)
      const toBalance = await manager.findOne(PortfolioInstitutionBalance, {
        where: {
          portfolio_id,
          institution_id,
          currency_code_id: to_currency_id,
        },
        relations: ['currency_code'],
      });

      return {
        exchange_group_id,
        updated_transaction_ids: [
          outRes.identifiers[0]?.id,
          inRes.identifiers[0]?.id,
        ].filter(Boolean),
        balance_after: {
          currency_code_id: to_currency_id,
          currency_code: toBalance?.currency_code?.currency_code ?? '',
          balance: Number(toBalance?.balance ?? 0),
          updated_at: new Date(
            toBalance?.updated_at ?? Date.now(),
          ).toISOString(),
        },
      };
    });
  }
}
