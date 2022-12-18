import { HttpException } from './HttpException';

export class EmailNotUniqueException extends HttpException {
  public code = 'EMAIL_NOT_UNIQUE';

  constructor(email: string) {
    super(409, `This Email ${email} already exists`);
  }
}
