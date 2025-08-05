// Crypto Response Decorators

import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { GetCryptosResponseDto } from 'src/modules/investment/crypto/dto';
import { GetDepositsResponseDto } from 'src/modules/investment/deposit/dto';
import { GetEtfsResponseDto } from 'src/modules/investment/etf/dto';
import { GetStocksResponseDto } from 'src/modules/investment/stock/dto';

/**
 * 암호화폐 목록 조회 응답
 */
export function ApiGetCryptosResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Crypto search results retrieved successfully.',
      type: GetCryptosResponseDto,
    }),
  );
}

// Deposit Response Decorators
/**
 * 예적금 목록 조회 응답
 */
export function ApiGetDepositsResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Deposit search results retrieved successfully.',
      type: GetDepositsResponseDto,
    }),
  );
}

// ETF Response Decorators
/**
 * ETF 목록 조회 응답
 */
export function ApiGetEtfsResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'ETF search results retrieved successfully.',
      type: GetEtfsResponseDto,
    }),
  );
}

// Stock Response Decorators
/**
 * 주식 목록 조회 응답
 */
export function ApiGetStocksResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Stock search results retrieved successfully.',
      type: GetStocksResponseDto,
    }),
  );
}
