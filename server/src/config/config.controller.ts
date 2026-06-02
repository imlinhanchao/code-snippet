import { Body, Controller, Get, Post } from '@nestjs/common';

import { UpdateConfigDto } from './dto/update-config.dto';
import { ConfigService } from './config.service';

@Controller('api/v1/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('status')
  getStatus() {
    return this.configService.status();
  }

  @Post()
  save(@Body() payload: UpdateConfigDto) {
    return this.configService.save(payload);
  }
}
