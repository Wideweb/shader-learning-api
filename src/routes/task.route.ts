import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import TasksController from '@controllers/task.controller';
import { CreateTaskDto, TaskSubmitDto, TaskSubmitWithValidationDto, UpdateTaskDto } from '@dtos/tasks.dto';
import authMiddleware from '@middlewares/auth.middleware';

class TasksRoute implements Routes {
  public path = '/tasks';
  public router = Router();
  public tasksController = new TasksController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create`, authMiddleware, validationMiddleware(CreateTaskDto, 'body'), this.tasksController.create);
    this.router.get(`${this.path}/:id/get`, authMiddleware, this.tasksController.get);
    this.router.get(`${this.path}/:id/toggleVisibility`, authMiddleware, this.tasksController.toggleVisibility);
    this.router.get(`${this.path}/list`, authMiddleware, this.tasksController.list);
    this.router.put(`${this.path}/:id/update`, authMiddleware, validationMiddleware(UpdateTaskDto, 'body'), this.tasksController.update);
    this.router.get(`${this.path}/:id/userTask`, authMiddleware, this.tasksController.getUserTask);
    this.router.get(`${this.path}/next`, authMiddleware, this.tasksController.getNext);
    this.router.get(`${this.path}/progress`, authMiddleware, this.tasksController.getProgress);
    this.router.post(
      `${this.path}/:id/submitWithValidation`,
      authMiddleware,
      validationMiddleware(TaskSubmitWithValidationDto, 'body'),
      this.tasksController.submitWithValidation,
    );
    this.router.post(`${this.path}/:id/submit`, authMiddleware, validationMiddleware(TaskSubmitDto, 'body'), this.tasksController.submit);
    this.router.get(`${this.path}/score`, authMiddleware, this.tasksController.getScore);
  }
}

export default TasksRoute;
