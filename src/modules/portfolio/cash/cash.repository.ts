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

@Injectable()
export class CashRepository {
  constructor(private dataSource: DataSource) {}

  async getCashBalances(
    paramDto: GetCashBalancesParamDto,
    queryDto: GetCashBalancesQueryDto,
  ) {
    return this.dataSource.getRepository(CashTransaction).find();
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
    return this.dataSource.getRepository(CashTransaction).find();
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
