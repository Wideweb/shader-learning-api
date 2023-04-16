import { HttpException } from './HttpException';

export class UserNotFoundException extends HttpException {
  public code = 'USER_NOT_FOUND';

  constructor(id: number) {
    super(409, `This User with Id ${id} was not found`);
  }
}
