import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { TesterService } from './tester.service';
import config from 'config';

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
<<<<<<< HEAD
<<<<<<< HEAD
    return res.redirect(config.get<string>('public-url.frontend'));
=======
    return res.redirect(process.env.FRONTEND_URL!);
>>>>>>> 9e630b5be567f65ad1493b8992e2a1a490c4bc42
=======
    return res.redirect(process.env.FRONTEND_URL!);
>>>>>>> b7459260804d0a53cb1036b70c40e9486b841d64
  }
}
