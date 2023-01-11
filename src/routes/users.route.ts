import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { Routes } from '@interfaces/routes.interface';
import { hasAllPermissions } from '@/middlewares/auth.middleware';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/rating`, hasAllPermissions(['users-rating']), this.usersController.getRankedList);
    this.router.get(`${this.path}/:id/profile`, hasAllPermissions(['view-profile']), this.usersController.getProfile);
    this.router.get(`${this.path}/:id/progress`, hasAllPermissions(['view-profile']), this.usersController.getProgress);
    // this.router.get(`${this.path}`, this.usersController.getUsers);
    // this.router.get(`${this.path}/:id`, this.usersController.getUserById);
    // this.router.post(`${this.path}`, validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    // this.router.put(`${this.path}/:id`, validationMiddleware(CreateUserDto, 'body', true), this.usersController.updateUser);
    // this.router.delete(`${this.path}/:id`, this.usersController.deleteUser);
  }
}

export default UsersRoute;
