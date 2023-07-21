import { Request } from 'express';
import { User } from '@interfaces/users.interface';

export interface DataStoredInToken {
  id: number;
  permissions: string[];
  sessionId: number;
}

export interface DataStoredInRefreshToken {
  id: number;
  sessionId: number;
}

export interface TokenData {
  accessToken: string;
  accessTokenLife: number;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenLife: number;
  refreshTokenExpiresAt: number;
}

export interface RequestWithUser extends Request {
  user: User | null;
  sessionId: number | null;
}
