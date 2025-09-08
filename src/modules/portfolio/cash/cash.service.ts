import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';
import { CashRepository } from './cash.repository';
import { GetCashBalancesParamDto } from '../dto/requests/cash/get-cash-balances.dto';
import { GetCashBalancesQueryDto } from '../dto/requests/cash/get-cash-balances.dto';
import { GetCashTransactionsParamDto } from '../dto/requests/cash/get-cash-transactions.dto';
import { GetCashTransactionsQueryDto } from '../dto/requests/cash/get-cash-transactions.dto';
import { CreateCashTransactionParamDto } from '../dto/requests/cash/create-cash-transaction.dto';
import { CreateCashTransactionBodyDto } from '../dto/requests/cash/create-cash-transaction.dto';
import {
  DeleteCashTransactionParamDto,
  DeleteExchangeCashTransactionParamDto,
} from '../dto/requests/cash/delete-cash-transaction.dto';
import { DeleteExchangeCashTransactionQueryDto } from '../dto/requests/cash/delete-cash-transaction.dto';
import { UpdateCashTransactionParamDto } from '../dto/requests/cash/update-cash-transaction.dto';
import { UpdateCashTransactionBodyDto } from '../dto/requests/cash/update-cash-transaction.dto';
import { GetCashBalancesResponseDto } from '../dto/responses/cash/get-cash-balances.dto';
import { GetCashTransactionsResponseDto } from '../dto/responses/cash/get-cash-transactions.dto';
import { CreateCashTransactionResponseDto } from '../dto/responses/cash/create-cash-transaction.dto';
import { DeleteCashTransactionResponseDto } from '../dto/responses/cash/delete-cash-transaction.dto';
import { UpdateCashTransactionResponseDto } from '../dto/responses/cash/update-cash-transaction.dto';
import { CashTransactionType } from '../dto/enum/cash-transaction-type.enum';
import { PortfolioValidator } from '../lib/portfolio-validator';
import { CashCreateType } from '../dto/enum/cash-create-type.enum';
import { BalancesSortBy } from '../dto/enum/balances-sortby.enum';
import { CashSortBy } from '../dto/enum/cash-sortby.enum';

@Injectable()
export class CashService {
  constructor(
    private readonly cashRepository: CashRepository,
    private readonly portfolioValidator: PortfolioValidator,
  ) {}

  // 기관별 예수금 조회
  async getCashBalances(
    paramDto: GetCashBalancesParamDto,
    queryDto: GetCashBalancesQueryDto,
    userId: string,
  ): Promise<GetCashBalancesResponseDto> {
    try {
      // 소유권 검증
      const { portfolio } =
        await this.portfolioValidator.validatePortfolioForCash(
          paramDto.portfolio_id,
          userId,
        );

      if (!portfolio) {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      // 예수금 조회
      const balances = await this.cashRepository.getCashBalances(
        paramDto,
        queryDto,
      );

      return {
        success: true,
        message: 'Cash balances retrieved successfully.',
        data: {
          portfolio_id: paramDto.portfolio_id,
          portfolio_name: portfolio.name,
          sorted_by: queryDto?.sortBy ?? BalancesSortBy.BALANCE,
          filters: {
            institution_id: queryDto?.institution_id ?? undefined,
            currency_code_id: queryDto?.currency_code_id ?? undefined,
          },
          balances: balances.map((b) => ({
            institution_id: b.institution_id,
            institution_name: b.institution?.display_name ?? '',
            currency_code_id: b.currency_code_id,
            currency_code: b.currency_code?.currency_code ?? '',
            symbol: b.currency_code?.symbol ?? '',
            balance: Number(b.balance),
            avg_rate:
              (b as any).avg_rate === null || (b as any).avg_rate === undefined
                ? null
                : Number((b as any).avg_rate),
            updated_at: (b.updated_at as Date).toISOString(),
          })),
        },
      };
    } catch (error) {
      throw new HttpException(
        ErrorResponseUtil.internalServerError('Failed to get cash balances'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 예수금 상세 조회
  async getCashTransactions(
    paramDto: GetCashTransactionsParamDto,
    queryDto: GetCashTransactionsQueryDto,
    userId: string,
  ): Promise<GetCashTransactionsResponseDto> {
    try {
      // 소유권 검증
      const { portfolio, institution } =
        await this.portfolioValidator.validatePortfolioAndFindUserAssetForCash(
          paramDto.portfolio_id,
          paramDto.institution_id,
          userId,
        );

      if (!portfolio || !institution) {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio or institution not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      // 예수금 상세 조회
      const result = await this.cashRepository.getCashTransactions(
        paramDto,
        queryDto,
      );

      // 반환
      return {
        success: true,
        message: 'Cash transactions retrieved successfully.',
        data: {
          portfolio_id: paramDto.portfolio_id,
          institution_id: paramDto.institution_id,
          sorted_by: queryDto?.sortBy ?? CashSortBy.RECORDED_AT,
          filters: {
            type: queryDto?.type ?? undefined,
            currency_code_id: queryDto?.currency_code_id ?? undefined,
            from: queryDto?.from ?? undefined,
            to: queryDto?.to ?? undefined,
          },
          pagination: {
            current_page: queryDto?.page ?? 1,
            limit: queryDto?.limit ?? 20,
            total_items: result.pagination,
            total_pages: Math.ceil(result.pagination / (queryDto?.limit ?? 20)),
          },
          items: result.items.map((t) => ({
            cash_transaction_id: t.id,
            type: t.type as unknown as CashTransactionType,
            amount: parseFloat(t.amount),
            currency_code_id: t.currency_code_id,
            currency_code: t.currency_code.currency_code,
            symbol: t.currency_code?.symbol ?? '',
            rate: (t as any).rate,
            recorded_at: t.recorded_at.toISOString(),
            memo: t.memo ?? null,
            exchange_group_id: t.exchange_group_id ?? null,
          })),
        },
      };
    } catch (error) {
      throw new HttpException(
        ErrorResponseUtil.internalServerError(
          'Failed to get cash transactions',
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 예수금 내역 추가
  async createCashTransaction(
    paramDto: CreateCashTransactionParamDto,
    bodyDto: CreateCashTransactionBodyDto,
    userId: string,
  ): Promise<CreateCashTransactionResponseDto> {
    try {
      // 소유권 검증
      const { portfolio, institution } =
        await this.portfolioValidator.validatePortfolioAndFindUserAssetForCash(
          paramDto.portfolio_id,
          paramDto.institution_id,
          userId,
        );

      if (!portfolio || !institution) {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio or institution not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      // 분기 처리로 일반거래 , 환전거래 구분
      if (bodyDto.type === CashCreateType.EXCHANGE) {
        const res = await this.cashRepository.createExchangeTransaction(
          paramDto,
          bodyDto,
        );

        return {
          success: true,
          message: 'Exchange cash transactions created successfully.',
          data: {
            portfolio_id: paramDto.portfolio_id,
            institution_id: paramDto.institution_id,
            exchange_group_id: res.exchange_group_id,
            transactions: res.transactions.map((t) => ({
              cash_transaction_id: t.id,
              type:
                (t.type as any) === 'exchange_out'
                  ? CashTransactionType.EXCHANGE_OUT
                  : CashTransactionType.EXCHANGE_IN,
              amount: t.amount,
              currency_code_id: t.currency_code_id,
              currency_code: '',
              recorded_at: t.recorded_at,
              memo: t.memo ?? null,
              exchange_group_id: res.exchange_group_id,
              rate: (t as any).rate,
            })),
            balances_after: res.balances_after.map((b) => ({
              currency_code_id: b.currency_code_id,
              currency_code: '',
              balance: b.balance,
              updated_at: b.updated_at,
            })),
          },
        };
      } else {
        const res = await this.cashRepository.createCashTransaction(
          paramDto,
          bodyDto,
        );

        return {
          success: true,
          message: 'Cash transaction created successfully.',
          data: {
            portfolio_id: paramDto.portfolio_id,
            institution_id: paramDto.institution_id,
            transaction: {
              cash_transaction_id: res.transaction.id,
              type: bodyDto.type as unknown as CashTransactionType,
              amount: res.transaction.amount,
              currency_code_id: res.transaction.currency_code_id,
              currency_code: res.transaction.currency_code,
              recorded_at: res.transaction.recorded_at,
              memo: res.transaction.memo ?? null,
              exchange_group_id: undefined,
            },
            balance_after: {
              currency_code_id: res.balance_after.currency_code_id,
              currency_code: res.transaction.currency_code,
              balance: res.balance_after.balance,
              updated_at: res.balance_after.updated_at,
            },
          },
        };
      }
    } catch (error) {
      // 에러 매핑: 의미있는 4xx로 변환
      const msg = (error as any)?.message || '';
      if (msg === 'Portfolio not found' || msg === 'Institution not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio or institution not found'),
          HttpStatus.NOT_FOUND,
        );
      }
      if (
        msg === 'Insufficient balance' ||
        msg === 'Invalid payload' ||
        msg === 'Invalid exchange payload' ||
        msg === 'Invalid exchange pair' ||
        msg === 'Invalid exchange amounts' ||
        msg === 'Exchange amounts do not match rate'
      ) {
        throw new HttpException(
          ErrorResponseUtil.badRequest(msg),
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        ErrorResponseUtil.internalServerError(
          'Failed to create cash transaction',
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 예수금 내역 삭제 (단건)
  async deleteCashTransaction(
    paramDto: DeleteCashTransactionParamDto,
    userId: string,
  ): Promise<DeleteCashTransactionResponseDto> {
    try {
      // 소유권 검증
      const { portfolio, institution, cashTransaction } =
        await this.portfolioValidator.validatePortfolioForCashTransaction(
          paramDto.portfolio_id,
          paramDto.institution_id,
          paramDto.id,
          userId,
        );

      if (!portfolio || !institution || !cashTransaction) {
        throw new HttpException(
          ErrorResponseUtil.notFound(
            'Portfolio or institution or cash transaction not found',
          ),
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        cashTransaction.type === CashTransactionType.EXCHANGE_IN ||
        cashTransaction.type === CashTransactionType.EXCHANGE_OUT
      ) {
        throw new HttpException(
          ErrorResponseUtil.badRequest('Cannot delete exchange transaction'),
          HttpStatus.BAD_REQUEST,
        );
      }

      const res = await this.cashRepository.deleteCashTransaction(paramDto);

      if (!res.balance) {
        throw new HttpException(
          ErrorResponseUtil.notFound('Balance not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Cash transaction deleted successfully.',
        data: {
          portfolio_id: paramDto.portfolio_id,
          institution_id: paramDto.institution_id,
          deleted_transaction_id: paramDto.id!,
          balance_after: {
            currency_code_id: res.balance.currency_code_id,
            currency_code: res.balance.currency_code.currency_code,
            balance: Number(res.balance.balance),
            updated_at: res.balance.updated_at.toISOString(),
          },
        },
      };
    } catch (error) {
      const msg = (error as any)?.message || '';
      if (msg === 'Transaction not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Transaction not found'),
          HttpStatus.NOT_FOUND,
        );
      }
      if (msg === 'Insufficient balance') {
        throw new HttpException(
          ErrorResponseUtil.badRequest('Insufficient balance for deletion'),
          HttpStatus.BAD_REQUEST,
        );
      }
      if (msg === 'Exchange transaction requires group deletion') {
        throw new HttpException(
          ErrorResponseUtil.badRequest(
            'Exchange leg deletion not allowed; use exchange_group_id',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        ErrorResponseUtil.internalServerError(
          'Failed to delete cash transaction',
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 예수금 내역 삭제 (그룹)
  async deleteCashTransactionGroup(
    paramDto: DeleteExchangeCashTransactionParamDto,
    queryDto: DeleteExchangeCashTransactionQueryDto,
    userId: string,
  ): Promise<DeleteCashTransactionResponseDto> {
    try {
      // 소유권 검증
      const { portfolio, institution } =
        await this.portfolioValidator.validatePortfolioAndFindUserAssetForCash(
          paramDto.portfolio_id,
          paramDto.institution_id,
          userId,
        );

      if (!portfolio || !institution) {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio or institution not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      // 예수금 내역 삭제
      const res = await this.cashRepository.deleteCashTransactionGroup(
        paramDto,
        queryDto,
      );

      return {
        success: true,
        message: 'Cash transaction group deleted successfully.',
        data: {
          portfolio_id: paramDto.portfolio_id,
          institution_id: paramDto.institution_id,
          exchange_group_id: queryDto.exchange_group_id!,
          deleted_transaction_ids: res.deleted_transaction_ids,
          balances_after: res.balances_after.map((b) => ({
            currency_code_id: b.currency_code_id,
            currency_code: b.currency_code ?? '',
            balance: Number(b.balance),
            updated_at: b.updated_at ?? new Date().toISOString(),
          })),
        },
      };
    } catch (error) {
      const msg = (error as any)?.message || '';
      if (msg === 'Transaction not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Transaction not found'),
          HttpStatus.NOT_FOUND,
        );
      }
      if (msg === 'Insufficient balance') {
        throw new HttpException(
          ErrorResponseUtil.badRequest('Insufficient balance for deletion'),
          HttpStatus.BAD_REQUEST,
        );
      }
      if (msg === 'Exchange transaction requires group deletion') {
        throw new HttpException(
          ErrorResponseUtil.badRequest(
            'Exchange leg deletion not allowed; use exchange_group_id',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        ErrorResponseUtil.internalServerError(
          'Failed to delete cash transaction',
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // TODO 예수금 내역 수정
  async updateCashTransaction(
    paramDto: UpdateCashTransactionParamDto,
    bodyDto: UpdateCashTransactionBodyDto,
  ): Promise<UpdateCashTransactionResponseDto> {
    await this.cashRepository.updateCashTransaction(paramDto, bodyDto);
    return {
      success: true,
      message: 'Cash transaction updated successfully.',
      data: {
        portfolio_id: paramDto.portfolio_id,
        institution_id: paramDto.institution_id,
        transaction: {
          cash_transaction_id: paramDto.id,
          type: CashTransactionType.DEPOSIT,
          amount: 0,
          currency_code_id: 0,
          currency_code: '',
          recorded_at: new Date().toISOString(),
          memo: bodyDto.memo ?? null,
          exchange_group_id: null,
        },
        balance_after: {
          currency_code_id: 0,
          currency_code: '',
          balance: 0,
          updated_at: new Date().toISOString(),
        },
      },
    };
  }
}
