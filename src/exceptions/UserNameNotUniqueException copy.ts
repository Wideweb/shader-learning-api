import { HttpException } from './HttpException';

export class UserNameNotUniqueException extends HttpException {
  public code = 'USER_NAME_NOT_UNIQUE';

  constructor(name: string) {
    super(409, `This User Name ${name} already exists`);
  }
}
