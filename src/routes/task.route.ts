import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import TasksController from '@/controllers/task.controller';
import { TaskSubmitDto } from '@/dtos/tasks.dto';
import authMiddleware from '@/middlewares/auth.middleware';

class TasksRoute implements Routes {
  public path = '/tasks';
  public router = Router();
  public tasksController = new TasksController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/next`, authMiddleware, this.tasksController.getNext);
    this.router.post(`${this.path}/:id/submit`, authMiddleware, validationMiddleware(TaskSubmitDto, 'body'), this.tasksController.submit);
    this.router.get(`${this.path}/score`, authMiddleware, this.tasksController.getScore);
  }
}

export default TasksRoute;
