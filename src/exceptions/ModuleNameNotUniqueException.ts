import { HttpException } from './HttpException';

export class ModuleNameNotUniqueException extends HttpException {
  public code = 'MODULE_NAME_NOT_UNIQUE';

  constructor(name: string) {
    super(409, `This Module Name ${name} already exists`);
  }
}
