import { NextFunction, Response } from 'express';
import {
  CreateTaskDto,
  TaskDto,
  TaskFeedbackDto,
  TaskListDto,
  TaskSubmitDto,
  TaskSubmitResultDto,
  UpdateTaskDto,
  UserTaskDto,
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

  public getChannel = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const taskId: number = parseInt(req.params.id);
      const index: number = parseInt(req.params.index);

      const buffer = await taskService.getTaskChannel(taskId, index);
      res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  };

  public like = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const taskId: number = parseInt(req.params.id);
      const value: boolean = req.body.value;

      logger.info(`TaskApi::like | userId:${userData?.id}; taskId:${taskId}; value:${value}.`);

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

      logger.info(`TaskApi::dislike | userId:${userData?.id}; taskId:${taskId}; value:${value}.`);

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

  public getUserTask = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const taskId: number = parseInt(req.params.id);

      const userTask: UserTaskDto = await taskService.getTaskForUser(userData.id, taskId);

      res.status(200).json(userTask);
    } catch (error) {
      next(error);
    }
  };

  // public submitWithValidation = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     const userData: User = req.user;
  //     const taskId: number = parseInt(req.params.id);
  //     const taskData: TaskSubmitWithValidationDto = req.body;

  //     taskData.id = taskId;

  //     const TaskSubmitData: TaskSubmitResultDto = await taskService.submitTaskWithValidation(userData.id, taskData);
  //     res.status(200).json(TaskSubmitData);
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public submit = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const taskId: number = parseInt(req.params.id);
      const taskData: TaskSubmitDto = req.body;

      logger.info(`TaskApi::submit | userId:${userData?.id}; taskId:${taskId}; match:${taskData?.match}.`);

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

  public feedback = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const taskId: number = parseInt(req.params.id);
      const feedback: TaskFeedbackDto = req.body;

      logger.info(
        `TaskApi::PostFeedback | 
        userId:${userData?.id}; 
        taskId:${taskId}; 
        strictRuntime:${feedback.strictRuntime}; 
        unclearDescription:${feedback.unclearDescription}; 
        other:${feedback.other}; 
        message:${feedback.message};`,
      );

      await taskService.saveFeedback(userData.id, taskId, feedback);
      res.status(200).json(true);
    } catch (error) {
      next(error);
    }
  };
}

export default TasksController;
