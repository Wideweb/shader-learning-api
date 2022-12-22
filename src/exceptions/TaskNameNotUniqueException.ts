import { HttpException } from './HttpException';

export class TaskNameNotUniqueException extends HttpException {
  public code = 'TASK_NAME_NOT_UNIQUE';

  constructor(name: string) {
    super(409, `This Task Name ${name} already exists`);
  }
}
