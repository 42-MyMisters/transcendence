import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('/hello')
@ApiTags('Test Router')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({
    summary: 'test router',
    description: 'send "Hello World!" to clients.',
  })
  @ApiOkResponse({ description: 'ok' })
  getHello(): string {
    return this.appService.getHello();
  }
}
