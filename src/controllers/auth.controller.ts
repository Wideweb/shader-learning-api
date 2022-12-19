import { NextFunction, Request, Response } from 'express';
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import authService from '@services/auth.service';

class AuthController {
  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const { tokenData, user } = await authService.signup(userData);

      res.setHeader('Set-Cookie', [authService.createCookie(tokenData)]);
      res.status(201).json({ tokenData, user });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: LoginUserDto = req.body;
      const { tokenData, user } = await authService.login(userData);

      res.setHeader('Set-Cookie', [authService.createCookie(tokenData)]);
      res.status(200).json({ tokenData, user });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      await authService.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ message: 'logout' });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
