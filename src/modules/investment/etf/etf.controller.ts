import { Controller } from '@nestjs/common';
import { EtfService } from './etf.service';

@Controller('etf')
export class EtfController {
  constructor(private readonly etfService: EtfService) {}
}
