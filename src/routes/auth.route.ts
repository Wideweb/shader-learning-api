import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto, GoogleLoginDto, GoogleSignUpDto, LoginUserDto, RequestResetPasswordDto, ResetPasswordDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';

class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}signup`, validationMiddleware(CreateUserDto, 'body'), this.authController.signUp);
    this.router.post(`${this.path}google-login`, validationMiddleware(GoogleLoginDto, 'body'), this.authController.loginWithGoogle);
    this.router.post(`${this.path}login`, validationMiddleware(LoginUserDto, 'body'), this.authController.logIn);
    this.router.post(`${this.path}logout`, authMiddleware, this.authController.logOut);
    this.router.get(`${this.path}me`, authMiddleware, this.authController.getMe);
    this.router.post(`${this.path}refreshToken`, this.authController.refreshToken);
    this.router.post(
      `${this.path}requestResetPassword`,
      validationMiddleware(RequestResetPasswordDto, 'body'),
      this.authController.requestResetPassword,
    );
    this.router.post(`${this.path}resetPassword`, validationMiddleware(ResetPasswordDto, 'body'), this.authController.resetPassword);
  }
}

export default AuthRoute;
