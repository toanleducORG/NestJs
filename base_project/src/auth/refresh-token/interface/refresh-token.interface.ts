import { UserInterface as User } from 'user/interfaces/user.interface';

export interface RefreshToken {
  userId: string;
  refreshToken: string;
  ip: string;
  browser: string;
  country: string;
}

export interface RefreshTokenRef {
  userId: User;
  refreshToken: string;
  ip: string;
  browser: string;
  country: string;
}
