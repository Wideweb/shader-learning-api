import { NextFunction, Request, Response } from 'express';
import { CreateUserDto, LoginUserDto, ResetPasswordDto, RequestResetPasswordDto } from '@dtos/users.dto';
import { RequestWithUser } from '@interfaces/auth.interface';
import authService from '@services/auth.service';
import { logger } from '@/utils/logger';

class AuthController {
  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;

      logger.info(`AuthApi::signUp | name:${userData?.name}; email:${userData?.email}; password:${userData?.password ? '[HIDDEN]' : ''}.`);

      const { tokenData, user } = await authService.signup(userData);

      res.setHeader('Set-Cookie', [authService.createCookie(tokenData.accessToken, tokenData.accessTokenLife)]);
      res.status(201).json({ tokenData, user });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: LoginUserDto = req.body;

      logger.info(`AuthApi::logIn | email:${userData?.email}; password:${userData?.password ? '[HIDDEN]' : ''}.`);

      const { tokenData, user } = await authService.login(userData);

      res.setHeader('Set-Cookie', [authService.createCookie(tokenData.accessToken, tokenData.accessTokenLife)]);
      res.status(200).json({ tokenData, user });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      logger.info(`AuthApi::logOut | userId:${req.user?.id}; sessionId:${req.sessionId}.`);

      await authService.logout(req.sessionId);

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

  public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.body.refreshToken;

      logger.info(`AuthApi::refreshToken | refreshToken:${refreshToken ? '[HIDDEN]' : ''}.`);

      const accessToken = await authService.refreshAccessToken(refreshToken);

      res.setHeader('Set-Cookie', [authService.createCookie(accessToken.token, accessToken.expiresIn)]);
      res.status(200).json(accessToken);
    } catch (error) {
      next(error);
    }
  };

  public requestResetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload: RequestResetPasswordDto = req.body;

      logger.info(`AuthApi::requestResetPassword | email:${payload?.email}.`);

      await authService.sendPasswordResetLink(payload.email);
      res.status(200).json(true);
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload: ResetPasswordDto = req.body;

      logger.info(`AuthApi::resetPassword | userId:${payload?.userId}; token:${payload?.token}; password:${payload?.password ? '[HIDDEN]' : ''}.`);

      const { tokenData, user } = await authService.resetPassword(payload.userId, payload.token, payload.password);
      res.status(200).json({ tokenData, user });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
