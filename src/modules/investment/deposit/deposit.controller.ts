import { Controller } from '@nestjs/common';
import { DepositService } from './deposit.service';

@Controller('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}
}
