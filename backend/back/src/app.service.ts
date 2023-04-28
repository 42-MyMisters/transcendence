import { Injectable } from '@nestjs/common';
import { CacheService } from './cache/cache.service';

@Injectable()
export class AppService {
  constructor(
    private cacheService: CacheService,
  ){}

  async getHello() {
    this.cacheService.addSet("HI", "ABCD");
    return await this.cacheService.get("HI");
  }
}
