import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';
import { CashRepository } from './cash.repository';
import { GetCashBalancesParamDto } from '../dto/requests/cash/get-cash-balances.dto';
import { GetCashBalancesQueryDto } from '../dto/requests/cash/get-cash-balances.dto';
import { GetCashTransactionsParamDto } from '../dto/requests/cash/get-cash-transactions.dto';
import { GetCashTransactionsQueryDto } from '../dto/requests/cash/get-cash-transactions.dto';
import { CreateCashTransactionParamDto } from '../dto/requests/cash/create-cash-transaction.dto';
import { CreateCashTransactionBodyDto } from '../dto/requests/cash/create-cash-transaction.dto';
import { DeleteCashTransactionParamDto } from '../dto/requests/cash/delete-cash-transaction.dto';
import { DeleteCashTransactionQueryDto } from '../dto/requests/cash/delete-cash-transaction.dto';
import { UpdateCashTransactionParamDto } from '../dto/requests/cash/update-cash-transaction.dto';
import { UpdateCashTransactionBodyDto } from '../dto/requests/cash/update-cash-transaction.dto';
import { GetCashBalancesResponseDto } from '../dto/responses/cash/get-cash-balances.dto';
import {
  GetCashTransactionsResponseDto,
  CashTransactionItem,
  PaginationMeta,
} from '../dto/responses/cash/get-cash-transactions.dto';
import {
  CreateCashTransactionResponseDto,
  CashTransactionItem as CreatedTxItem,
  CashBalanceItem as CreatedBalanceItem,
} from '../dto/responses/cash/create-cash-transaction.dto';
import { DeleteCashTransactionResponseDto } from '../dto/responses/cash/delete-cash-transaction.dto';
import { UpdateCashTransactionResponseDto } from '../dto/responses/cash/update-cash-transaction.dto';
import { CashTransactionType } from '../dto/enum/cash-transaction-type.enum';
import { PortfolioValidator } from '../lib/portfolio-validator';
import { CashCreateType } from '../dto/enum/cash-create-type.enum';

@Injectable()
export class CashService {
  constructor(
    private readonly cashRepository: CashRepository,
    private readonly portfolioValidator: PortfolioValidator,
  ) {}

  async getCashBalances(
    paramDto: GetCashBalancesParamDto,
    queryDto: GetCashBalancesQueryDto,
  ): Promise<GetCashBalancesResponseDto> {
    const balances = await this.cashRepository.getCashBalances(
      paramDto,
      queryDto,
    );
    return {
      success: true,
      message: 'Cash balances retrieved successfully.',
      data: {
        portfolio_id: paramDto.portfolio_id,
        portfolio_name: '',
        sorted_by: queryDto?.sortBy ?? 'balance',
        filters: {
          institution_id: queryDto?.institution_id,
          currency_code_id: queryDto?.currency_code_id,
        },
        // map to response shape when repository implemented
        balances: (balances as any[]).map(() => ({
          institution_id: 0,
          institution_name: '',
          currency_code_id: 0,
          currency_code: '',
          balance: 0,
          avg_rate: null,
          updated_at: new Date().toISOString(),
        })),
      },
    };
  }

  async getCashTransactions(
    paramDto: GetCashTransactionsParamDto,
    queryDto: GetCashTransactionsQueryDto,
  ): Promise<GetCashTransactionsResponseDto> {
    const items = await this.cashRepository.getCashTransactions(
      paramDto,
      queryDto,
    );
    const pagination: PaginationMeta = {
      current_page: queryDto.page ?? 1,
      limit: queryDto.limit ?? 20,
      total_items: Array.isArray(items) ? items.length : 0,
      total_pages: 1,
    };
    return {
      success: true,
      message: 'Cash transactions retrieved successfully.',
      data: {
        portfolio_id: paramDto.portfolio_id,
        institution_id: paramDto.institution_id,
        sorted_by: (queryDto?.sortBy as any) ?? 'recorded_at',
        filters: {
          type: queryDto?.type,
          currency_code_id: queryDto?.currency_code_id,
          from: queryDto?.from,
          to: queryDto?.to,
        },
        pagination,
        items: (items as any[]).map(
          () =>
            ({
              cash_transaction_id: 0,
              type: CashTransactionType.DEPOSIT,
              amount: 0,
              currency_code_id: 0,
              currency_code: '',
              recorded_at: new Date().toISOString(),
              memo: null,
              exchange_group_id: null,
            }) as CashTransactionItem,
        ),
      },
    };
  }

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

  async deleteCashTransaction(
    paramDto: DeleteCashTransactionParamDto,
  ): Promise<DeleteCashTransactionResponseDto> {
    await this.cashRepository.deleteCashTransaction(paramDto, {} as any);
    return {
      success: true,
      message: 'Cash transaction deleted successfully.',
      data: {
        portfolio_id: paramDto.portfolio_id,
        institution_id: paramDto.institution_id,
        deleted_transaction_id: paramDto.id!,
        balance_after: {
          currency_code_id: 0,
          currency_code: '',
          balance: 0,
          updated_at: new Date().toISOString(),
        },
      },
    };
  }

  async deleteCashTransactionGroup(
    queryDto: DeleteCashTransactionQueryDto,
  ): Promise<DeleteCashTransactionResponseDto> {
    await this.cashRepository.deleteCashTransactionGroup(queryDto);
    return {
      success: true,
      message: 'Exchange cash transactions deleted successfully.',
      data: {
        portfolio_id: 0,
        institution_id: 0,
        exchange_group_id: queryDto.exchange_group_id!,
        deleted_transaction_ids: [],
        balances_after: [],
      },
    } as any;
  }

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
