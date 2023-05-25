import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/database/entity/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TesterService {
  constructor(
   private userService: UserService,
   private authService: AuthService,
  ){}

  generateUniqueNickname() {
    const now = new Date();
    const seed = now.getTime();
  
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const minLength = 2;
    const maxLength = 10;
  
    const usedNames = new Set();
  
    while (true) {
      let name = '';
      const nameLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
      for (let i = 0; i < nameLength; i++) {
        const index = Math.floor(Math.random() * alphabet.length);
        name += alphabet[index];
      }
  
      // 중복체크
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
  
      //모든 이름이 중복일때 날리기
      if (usedNames.size === Math.pow(alphabet.length, maxLength)) {
        usedNames.clear();
      }
    }
  }
  generateUniqueID() {
    const maxInt = Math.pow(2, 31) - 1;
    const usedIDs = new Set();
  
    while (true) {
      const id = Math.floor(Math.random() * maxInt);
  
      if (!usedIDs.has(id)) {
        usedIDs.add(id);
        return id;
      }
  
      if (usedIDs.size === maxInt) {
        usedIDs.clear();
      }
    }
  }

  randomUserGenerate() : User{
    const user = new User();
    user.uid = this.generateUniqueID();
    user.nickname = this.generateUniqueNickname();
    user.profileUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/1200px-Elon_Musk_Royal_Society_%28crop2%29.jpg";
    user.twoFactorEnabled = false;
    return user;
  }
  

  async userGenerate(){
    const user = await this.userService.addNewUserTest(this.randomUserGenerate());
    const { access_token, refresh_token } = await this.authService.login(user);
    await this.userService.setUserRefreshToken(user, refresh_token);
    return {access_token, refresh_token};
  }
  
}
