import { Injectable } from '@nestjs/common';
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
import {
  GetCashBalancesResponseDto,
} from '../dto/responses/cash/get-cash-balances.dto';
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
import {
  DeleteCashTransactionResponseDto,
} from '../dto/responses/cash/delete-cash-transaction.dto';
import {
  UpdateCashTransactionResponseDto,
} from '../dto/responses/cash/update-cash-transaction.dto';
import { CashTransactionType } from '../dto/enum/cash-transaction-type.enum';

@Injectable()
export class CashService {
  constructor(private readonly cashRepository: CashRepository) {}

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
        items: (items as any[]).map(() => ({
          cash_transaction_id: 0,
          type: CashTransactionType.DEPOSIT,
          amount: 0,
          currency_code_id: 0,
          currency_code: '',
          recorded_at: new Date().toISOString(),
          memo: null,
          exchange_group_id: null,
        } as CashTransactionItem)),
      },
    };
  }

  async createCashTransaction(
    paramDto: CreateCashTransactionParamDto,
    bodyDto: CreateCashTransactionBodyDto,
  ): Promise<CreateCashTransactionResponseDto> {
    await this.cashRepository.createCashTransaction(paramDto, bodyDto);
    // placeholder response; will be replaced with real data mapping
    return {
      success: true,
      message: 'Cash transaction created successfully.',
      data: {
        portfolio_id: paramDto.portfolio_id,
        institution_id: paramDto.institution_id,
        transaction: {
          cash_transaction_id: 0,
          type: CashTransactionType.DEPOSIT,
          amount: 0,
          currency_code_id: 0,
          currency_code: '',
          recorded_at: new Date(bodyDto.recorded_at).toISOString(),
          memo: bodyDto.memo ?? null,
          exchange_group_id: undefined,
        } as CreatedTxItem,
        balance_after: {
          currency_code_id: 0,
          currency_code: '',
          balance: 0,
          updated_at: new Date().toISOString(),
        } as CreatedBalanceItem,
      },
    };
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
