export interface TokenPayload {
    iat: number;
    exp: number;
    uid: number;
    email: string;
    twoFactorEnabled: boolean;
    twoFactorAuthenticated: boolean;
  }
  