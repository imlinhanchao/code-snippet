import { Module } from '@nestjs/common';

import { FavService } from './fav.service';

@Module({
  providers: [FavService],
  exports: [FavService],
})
export class FavModule {}
