import { HttpException } from './HttpException';

export class UserNameNotFoundExcrption extends HttpException {
  public code = 'USER_NAME_NOT_FOUND';

  constructor(name: string) {
    super(409, `This User Name ${name} was not found`);
  }
}
