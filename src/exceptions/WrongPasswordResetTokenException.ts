import { HttpException } from './HttpException';

export class WrongPasswordResetTokenException extends HttpException {
  public code = 'WRONG_PASSWORD_RESET_TOKEN';

  constructor(userId: number, token: string) {
    super(409, `Wrong password reset token | userId:${userId}; token:${token}`);
  }
}
