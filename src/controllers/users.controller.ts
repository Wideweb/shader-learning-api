import { NextFunction, Request, Response } from 'express';
import userService from '@services/users.service';

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
