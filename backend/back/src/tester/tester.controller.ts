import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TesterService } from './tester.service';

@Controller('/tester')
@ApiTags('Test Router')
export class TesterController {
  constructor(private readonly testerService: TesterService) { }

  @ApiOperation({
    summary: 'test router',
    description: 'send "Hello World!" to clients.',
  })
  @ApiOkResponse({ description: 'ok' })
  @Get("/addUser")
  async registerUser() {
    return await this.testerService.userGenerate();
  }
}
