import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { Routes } from '@interfaces/routes.interface';
import { hasAllPermissions } from '@/middlewares/auth.middleware';

class MeRoute implements Routes {
  public path = '/me';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/profile`, hasAllPermissions(['profile_view']), this.usersController.getProfileMe);
    this.router.get(`${this.path}/progress`, hasAllPermissions(['profile_view']), this.usersController.getProgressMe);
  }
}

export default MeRoute;
