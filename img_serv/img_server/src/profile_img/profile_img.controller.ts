import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as sharp from 'sharp';
import { createWriteStream } from 'fs';
import { randomBytes } from 'crypto';

@Controller('profile-image')
export class ProfileImageController {
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(@UploadedFile() file) {
    // Generate a unique file name
    const timestamp = new Date().getTime();
    const randomString = randomBytes(4).toString('hex');
    const filename = `${timestamp}-${randomString}.jpg`;

    // Resize and compress the image
    const resizedImage = await sharp(file.buffer)
      .resize(500, 500)
      .jpeg({ quality: 70 })
      .toBuffer();

    // Save the image to disk or cloud storage
    const fileStream = createWriteStream(`uploads/${filename}`);
    fileStream.write(resizedImage);
    fileStream.end();

    // Send a response to the client
    return { img_url: `http://localhost:5000/profile-image:${filename}` };
    // return { message: 'Image uploaded and resized successfully' };
  }

  @Get(':filename')
  async serveProfileImage(@Param('filename') filename, @Res() res) {
    // Serve the image to the client
    return res.sendFile(filename, { root: 'uploads' });
  }
}