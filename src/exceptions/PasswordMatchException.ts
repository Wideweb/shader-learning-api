import { HttpException } from './HttpException';

export class PasswordMatchException extends HttpException {
  public code = 'PASSWORD_NOT_MATCH';

  constructor() {
    super(409, `Password is not matching`);
  }
}
