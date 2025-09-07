import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CashService } from './cash.service';
import {
  GetCashBalancesParamDto,
  GetCashBalancesQueryDto,
} from '../dto/requests/cash/get-cash-balances.dto';
import { GetCashBalancesResponseDto } from '../dto/responses/cash/get-cash-balances.dto';
import { GetCashTransactionsResponseDto } from '../dto/responses/cash/get-cash-transactions.dto';
import {
  GetCashTransactionsParamDto,
  GetCashTransactionsQueryDto,
} from '../dto/requests/cash/get-cash-transactions.dto';
import {
  CreateCashTransactionBodyDto,
  CreateCashTransactionParamDto,
} from '../dto/requests/cash/create-cash-transaction.dto';
import { CreateCashTransactionResponseDto } from '../dto/responses/cash/create-cash-transaction.dto';
import {
  DeleteCashTransactionParamDto,
  DeleteCashTransactionQueryDto,
} from '../dto/requests/cash/delete-cash-transaction.dto';
import {
  UpdateCashTransactionBodyDto,
  UpdateCashTransactionParamDto,
} from '../dto/requests/cash/update-cash-transaction.dto';
import { DeleteCashTransactionResponseDto } from '../dto/responses/cash/delete-cash-transaction.dto';
import { UpdateCashTransactionResponseDto } from '../dto/responses/cash/update-cash-transaction.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/modules/auth/decorators/user.decorator';

@ApiTags('cash')
@Controller('/portfolios/:portfolio_id')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  // 기관별 예수금 조회
  @Get('/cash/balances')
  async getCashBalances(
    @Param() getCashBalancesParamDto: GetCashBalancesParamDto,
    @Query() getCashBalancesQueryDto: GetCashBalancesQueryDto,
  ): Promise<GetCashBalancesResponseDto> {
    return this.cashService.getCashBalances(
      getCashBalancesParamDto,
      getCashBalancesQueryDto,
    );
  }

  // 예수금 상세 조회
  @Get('institutions/:institution_id/cash/transactions')
  async getCashTransactions(
    @Param() getCashTransactionsParamDto: GetCashTransactionsParamDto,
    @Query() getCashTransactionsQueryDto: GetCashTransactionsQueryDto,
  ): Promise<GetCashTransactionsResponseDto> {
    return this.cashService.getCashTransactions(
      getCashTransactionsParamDto,
      getCashTransactionsQueryDto,
    );
  }

  // 예수금 내역 추가
  @Post('institutions/:institution_id/cash/transactions')
  async createCashTransaction(
    @Param() createCashTransactionParamDto: CreateCashTransactionParamDto,
    @Body() createCashTransactionBodyDto: CreateCashTransactionBodyDto,
    @User() user: any,
  ): Promise<CreateCashTransactionResponseDto> {
    return await this.cashService.createCashTransaction(
      createCashTransactionParamDto,
      createCashTransactionBodyDto,
      user.id,
    );
  }

  // 예수금 내역 삭제 (단건)
  @Delete('institutions/:institution_id/cash/transactions/:id')
  async deleteCashTransaction(
    @Param() deleteCashTransactionParamDto: DeleteCashTransactionParamDto,
  ): Promise<DeleteCashTransactionResponseDto> {
    return this.cashService.deleteCashTransaction(
      deleteCashTransactionParamDto,
    );
  }

  // 예수금 내역 삭제 (그룹)
  @Delete('institutions/:institution_id/cash/transactions')
  async deleteCashTransactionGroup(
    @Query()
    deleteCashTransactionGroupQueryDto: DeleteCashTransactionQueryDto,
  ): Promise<DeleteCashTransactionResponseDto> {
    return this.cashService.deleteCashTransactionGroup(
      deleteCashTransactionGroupQueryDto,
    );
  }

  // 예수금 내역 수정
  @Put('institutions/:institution_id/cash/transactions/:id')
  async updateCashTransaction(
    @Param() updateCashTransactionParamDto: UpdateCashTransactionParamDto,
    @Body() updateCashTransactionBodyDto: UpdateCashTransactionBodyDto,
  ): Promise<UpdateCashTransactionResponseDto> {
    return this.cashService.updateCashTransaction(
      updateCashTransactionParamDto,
      updateCashTransactionBodyDto,
    );
  }
}
