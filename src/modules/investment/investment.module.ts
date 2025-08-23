import { Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { StockModule } from './stock/stock.module';
import { EtfModule } from './etf/etf.module';
import { CryptoModule } from './crypto/crypto.module';
import { DepositModule } from './deposit/deposit.module';

@Module({
  providers: [InvestmentService],
  imports: [StockModule, EtfModule, CryptoModule, DepositModule],
  exports: [StockModule, EtfModule, CryptoModule, DepositModule],
})
export class InvestmentModule {}
