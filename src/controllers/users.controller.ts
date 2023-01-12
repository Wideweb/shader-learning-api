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

  public getProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: number = parseInt(req.params.id);
      const results: UserTaskResultDto[] = await taskService.getUserTaskResults(userId);

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

  // public getUserById = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId: string = req.params.id;
  //     const findOneUserData: User = await this.userService.findUserById(userId);
  //     res.status(200).json({ data: findOneUserData, message: 'findOne' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  // public createUser = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userData: CreateUserDto = req.body;
  //     const createUserData: User = await this.userService.(userData);
  //     res.status(201).json({ data: createUserData, message: 'created' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  // public updateUser = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId: string = req.params.id;
  //     const userData: CreateUserDto = req.body;
  //     const updateUserData: User = await this.userService.updateUser(userId, userData);
  //     res.status(200).json({ data: updateUserData, message: 'updated' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  // public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId: string = req.params.id;
  //     const deleteUserData: User = await this.userService.deleteUser(userId);
  //     res.status(200).json({ data: deleteUserData, message: 'deleted' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default UsersController;
