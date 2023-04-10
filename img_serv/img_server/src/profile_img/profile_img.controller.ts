import { Controller, Get, Logger, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import * as sharp from 'sharp';

@Controller('profile-image')
export class ProfileImageController {
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async uploadProfileImage(@UploadedFiles() file: Express.Multer.File[]) {

    // Resize and compress the image
    const resizedImage = await sharp(file[0].buffer)
      .resize(500, 500)
      .jpeg({ quality: 70 })
      .toBuffer();

    Logger.log("ProfileImage");
    // Save the image to disk or cloud storage
    const fileStream = createWriteStream(`uploads/${file[0].filename}`);
    fileStream.write(resizedImage);
    fileStream.end();

    // Send a response to the client
    return { img_url: `http://localhost:5000/profile-image/${file[0].filename}` };
    // return { message: 'Image uploaded and resized successfully' };
  }

  @Get(':filename')
  async serveProfileImage(@Param('filename') filename, @Res() res) {
    // Serve the image to the client
    Logger.log(`servProfileImage ${filename}`);
    return res.sendFile(filename, { root: 'uploads' });
  }
}