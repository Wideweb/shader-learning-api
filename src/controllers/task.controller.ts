import { NextFunction, Response } from 'express';
import {
  CreateTaskDto,
  TaskDto,
  TaskListDto,
  TaskSubmitDto,
  TaskSubmitResultDto,
  TaskSubmitWithValidationDto,
  UpdateTaskDto,
  UserTaskDto,
  UserTaskResultDto,
} from '@dtos/tasks.dto';
import { logger } from '@utils/logger';
import taskService from '@services/tasks.service';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';

class TasksController {
  public create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const taskData: CreateTaskDto = req.body;

      const id = await taskService.createTask(taskData, userData.id);
      res.status(200).json(id);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const taskData: UpdateTaskDto = req.body;

      const id = await taskService.updateTask(taskData);
      res.status(200).json(id);
    } catch (error) {
      next(error);
    }
  };

  public get = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const taskId: number = parseInt(req.params.id);
      const task: TaskDto = await taskService.getTask(taskId);

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };

  public like = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const taskId: number = parseInt(req.params.id);
      const value: boolean = req.body.value;

      const updated = await taskService.like(userData.id, taskId, value);

      const likes = await taskService.getLikesNumber(taskId);
      const dislikes = await taskService.getDislikesNumber(taskId);

      res.status(200).json({ likes, dislikes, updated });
    } catch (error) {
      next(error);
    }
  };

  public dislike = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const taskId: number = parseInt(req.params.id);
      const value: boolean = req.body.value;

      const updated = await taskService.dislike(userData.id, taskId, value);

      const likes = await taskService.getLikesNumber(taskId);
      const dislikes = await taskService.getDislikesNumber(taskId);

      res.status(200).json({ likes, dislikes, updated });
    } catch (error) {
      next(error);
    }
  };

  public toggleVisibility = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const taskId: number = parseInt(req.params.id);
      const result = await taskService.toggleTaskVisibility(taskId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const results: TaskListDto[] = await taskService.getTaskList();

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };

  public rerorder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const oldOrder: number = parseInt(req.body.oldOrder);
      const newOrder: number = parseInt(req.body.newOrder);
      const result = await taskService.reorder(oldOrder, newOrder);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getUserTask = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const taskId: number = parseInt(req.params.id);
      logger.info(`Get user task id = ${JSON.stringify(req.params)}`);
      const userTask: UserTaskDto = await taskService.getTaskForUser(userData.id, taskId);

      res.status(200).json(userTask);
    } catch (error) {
      next(error);
    }
  };

  public getNext = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const userTask: UserTaskDto = await taskService.getNextTaskForUser(userData.id);

      res.status(200).json(userTask);
    } catch (error) {
      next(error);
    }
  };

  public getProgress = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const results: UserTaskResultDto[] = await taskService.getUserTaskResults(userData.id);

      res.status(200).json(results);
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

      const TaskSubmitData: TaskSubmitResultDto = await taskService.submitTask(userData, taskData);
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
