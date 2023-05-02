import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

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
  getHello() {
    return this.appService.getHello();
  }
}
