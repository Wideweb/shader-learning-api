import { HttpException } from './HttpException';

export class UserEmailNotFoundExcrption extends HttpException {
  public code = 'EMAIL_NOT_FOUND';

  constructor(email: string) {
    super(409, `This User email ${email} was not found`);
  }
}
