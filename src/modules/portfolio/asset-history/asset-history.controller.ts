import { Controller } from '@nestjs/common';
import { AssetHistoryService } from './asset-history.service';

@Controller('asset-history')
export class AssetHistoryController {
  constructor(private readonly assetHistoryService: AssetHistoryService) {}
}
