import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import {Cache} from "cache-manager";
import config from "config";

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
    static exp = config.get<number>('cache.exp');

    async addSet(key, value){
        await this.cacheManager.set(key, value, CacheService.exp);
    }

    async get(key) {
        return await this.cacheManager.get(key);
    }

    async clear(){
        return await this.cacheManager.reset();
    }

}