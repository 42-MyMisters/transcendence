import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
@ApiTags('root')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'summary - Get Hello', description: 'description - Get Hello' })
  @ApiResponse({ status: 200, description: 'descripiton - Hello World!' })
  getHello(): string {
    return this.appService.getHello();
  }
}
