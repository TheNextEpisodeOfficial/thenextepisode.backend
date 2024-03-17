import { Module } from '@nestjs/common';
import { PostgreConfigService } from './config.service';

@Module({
  providers: [PostgreConfigService],
})
export class PostgreConfigModule {}
