import { NextFunction, Response } from 'express';
import { TaskDto, TaskSubmitDto, TaskSubmitResultDto, TaskSubmitWithValidationDto } from '@dtos/tasks.dto';
import { logger } from '@utils/logger';
import taskService from '@services/tasks.service';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';

class TasksController {
  public getNext = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const task: TaskDto = await taskService.getNextTaskForUser(userData.id);

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };

  public submitWithValidation = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const taskId: number = parseInt(req.params.id);
      const taskData: TaskSubmitWithValidationDto = req.body;

      taskData.id = taskId;

      const TaskSubmitData: TaskSubmitResultDto = await taskService.submitTaskWithValidation(userData.id, taskData);
      res.status(200).json(TaskSubmitData);
    } catch (error) {
      next(error);
    }
  };

  public submit = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const taskId: number = parseInt(req.params.id);
      const taskData: TaskSubmitDto = req.body;

      taskData.id = taskId;

      const TaskSubmitData: TaskSubmitResultDto = await taskService.submitTask(userData.id, taskData);
      res.status(200).json(TaskSubmitData);
    } catch (error) {
      next(error);
    }
  };

  public getScore = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const score: number = await taskService.getUserScore(userData.id);

      res.status(200).json(score);
    } catch (error) {
      next(error);
    }
  };
}

export default TasksController;
