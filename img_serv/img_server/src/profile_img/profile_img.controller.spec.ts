import { Test, TestingModule } from '@nestjs/testing';
import { ProfileImgController } from './profile_img.controller';

describe('ProfileImgController', () => {
  let controller: ProfileImgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileImgController],
    }).compile();

    controller = module.get<ProfileImgController>(ProfileImgController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
