import { NextFunction, Request, Response } from 'express';
import userService from '@services/users.service';
import taskService from '@services/tasks.service';
import { UserTaskResultDto } from '@/dtos/tasks.dto';
import { RequestWithUser } from '@/interfaces/auth.interface';

class UsersController {
  public getRankedList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await userService.getRankedList();
      res.status(200).json(list);
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: number = parseInt(req.params.id);
      const profile = await userService.getProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  public getProgress = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const myId: number = req.user?.id;
      const userId: number = parseInt(req.params.id);
      let results: UserTaskResultDto[] = [];

      if (!myId) {
        results = await taskService.getUserTaskResults(userId);
      } else {
        results = await taskService.getUserTaskResultsForMe(userId, myId);
      }

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };

  public getProfileMe = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId: number = req.user.id;
      const profile = await userService.getProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  public getProgressMe = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId: number = req.user.id;
      const results: UserTaskResultDto[] = await taskService.getUserTaskResults(userId);

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
