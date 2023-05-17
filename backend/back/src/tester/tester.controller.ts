import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TesterService } from './tester.service';
import config from 'config';

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
  async registerUser(@Res() res: Response) {
    const tokenSet = await this.testerService.userGenerate();
    res.cookie('accessToken', tokenSet.access_token,
      {
        httpOnly: true,
        sameSite: 'strict',
        // secure: true //only https option
      });
    res.cookie('refreshToken', tokenSet.refresh_token);
    return res.redirect(config.get<string>('public-url.frontend'));
  }

  @Get("/elo")
  async eloCalc() {
    // this.testerService.eloLogic(0,0,)
  }
}
