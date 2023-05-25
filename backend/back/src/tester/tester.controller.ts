import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { TesterService } from './tester.service';

@Controller("tester")
export class TesterController {
  constructor(private readonly testerService: TesterService) { }

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
    return res.redirect('http://localhost:3000/');
  }
}
