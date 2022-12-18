import { HttpException } from './HttpException';

export class TaskNotFoundException extends HttpException {
  public code = 'TASK_NOT_FOUND';

  constructor(name: string) {
    super(409, `This Task ${name} was not found`);
  }
}
