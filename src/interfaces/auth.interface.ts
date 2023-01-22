import { Request } from 'express';
import { User } from '@interfaces/users.interface';

export interface DataStoredInToken {
  id: number;
  permissions: string[];
}

export interface DataStoredInRefreshToken {
  id: number;
}

export interface TokenData {
  accessToken: string;
  accessTokenLife: number;
  refreshToken: string;
  refreshTokenLife: number;
}

export interface RequestWithUser extends Request {
  user: User | null;
}
