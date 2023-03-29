export interface TokenPayload {
    iat: number;
    exp: number;
    uid: number;
    twoFactorEnabled: boolean;
    twoFactorAuthenticated: boolean;
  }
  