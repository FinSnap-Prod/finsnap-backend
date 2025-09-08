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
import { BalancesSortBy } from '../dto/enum/balances-sortby.enum';
import { SortOrder } from '../dto/enum/sort-order.enum';
import { User } from 'src/modules/auth/decorators/user.decorator';
import {
  CreateCashTransactionBodyDto,
  CreateCashTransactionParamDto,
} from '../dto/requests/cash/create-cash-transaction.dto';
import { CreateCashTransactionResponseDto } from '../dto/responses/cash/create-cash-transaction.dto';
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
import { DeleteCashTransactionResponseDto } from '../dto/responses/cash/delete-cash-transaction.dto';
import {
  UpdateCashTransactionGroupResponseDto,
  UpdateCashTransactionResponseDto,
} from '../dto/responses/cash/update-cash-transaction.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('cash')
@Controller('/portfolios/:portfolio_id')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  // 기관별 예수금 조회
  @Get('/cash/balances')
  async getCashBalances(
    @Param() getCashBalancesParamDto: GetCashBalancesParamDto,
    @Query() getCashBalancesQueryDto: GetCashBalancesQueryDto,
    @User() user: any,
  ): Promise<GetCashBalancesResponseDto> {
    // Query 데이터가 없을 경우 기본값 설정
    const queryData: GetCashBalancesQueryDto = {
      institution_id: getCashBalancesQueryDto?.institution_id,
      currency_code_id: getCashBalancesQueryDto?.currency_code_id,
      sortBy: getCashBalancesQueryDto?.sortBy || BalancesSortBy.BALANCE,
      order: getCashBalancesQueryDto?.order || SortOrder.DESC,
    };

    return this.cashService.getCashBalances(
      getCashBalancesParamDto,
      queryData,
      user.id,
    );
  }

  // 예수금 상세 조회
  @Get('institutions/:institution_id/cash/transactions')
  async getCashTransactions(
    @Param() getCashTransactionsParamDto: GetCashTransactionsParamDto,
    @Query() getCashTransactionsQueryDto: GetCashTransactionsQueryDto,
    @User() user: any,
  ): Promise<GetCashTransactionsResponseDto> {
    return this.cashService.getCashTransactions(
      getCashTransactionsParamDto,
      getCashTransactionsQueryDto,
      user.id,
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
    @Param()
    deleteCashTransactionParamDto: DeleteCashTransactionParamDto,
    @User() user: any,
  ): Promise<DeleteCashTransactionResponseDto> {
    return this.cashService.deleteCashTransaction(
      deleteCashTransactionParamDto,
      user.id,
    );
  }

  // 예수금 내역 삭제 (환전)
  @Delete('institutions/:institution_id/cash/transactions')
  async deleteCashTransactionGroup(
    @Param()
    deleteExchangeCashTransactionParamDto: DeleteExchangeCashTransactionParamDto,
    @Query()
    deleteExchangeCashTransactionQueryDto: DeleteExchangeCashTransactionQueryDto,
    @User() user: any,
  ): Promise<DeleteCashTransactionResponseDto> {
    return this.cashService.deleteCashTransactionGroup(
      deleteExchangeCashTransactionParamDto,
      deleteExchangeCashTransactionQueryDto,
      user.id,
    );
  }

  // 예수금 내역 수정 (단건)
  @Put('institutions/:institution_id/cash/transactions/:id')
  async updateCashTransaction(
    @Param() updateCashTransactionParamDto: UpdateCashTransactionParamDto,
    @Body() updateCashTransactionBodyDto: UpdateCashTransactionBodyDto,
    @User() user: any,
  ): Promise<UpdateCashTransactionResponseDto> {
    return this.cashService.updateCashTransaction(
      updateCashTransactionParamDto,
      updateCashTransactionBodyDto,
      user.id,
    );
  }

  // 예수금 내역 수정 (환전)
  @Put('institutions/:institution_id/cash/transactions')
  async updateCashTransactionGroup(
    @Param()
    updateCashTransactionParamDto: UpdateExchangeCashTransactionParamDto,
    @Body()
    updateCashTransactionBodyDto: UpdateExchangeCashTransactionBodyDto,
    @Query()
    updateCashTransactionQueryDto: UpdateExchangeCashTransactionQueryDto,
    @User() user: any,
  ): Promise<UpdateCashTransactionGroupResponseDto> {
    return this.cashService.updateCashTransactionGroup(
      updateCashTransactionParamDto,
      updateCashTransactionBodyDto,
      updateCashTransactionQueryDto,
      user.id,
    );
  }
}
