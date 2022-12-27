import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import TasksController from '@controllers/task.controller';
import { CreateTaskDto, TaskReorderDto, TaskSubmitDto, TaskSubmitWithValidationDto, UpdateTaskDto } from '@dtos/tasks.dto';
import { hasAllPermissions } from '@/middlewares/auth.middleware';

class TasksRoute implements Routes {
  public path = '/tasks';
  public router = Router();
  public tasksController = new TasksController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      hasAllPermissions(['task_create']),
      validationMiddleware(CreateTaskDto, 'body'),
      this.tasksController.create,
    );

    this.router.get(`${this.path}/:id/get`, hasAllPermissions(['task_view']), this.tasksController.get);

    this.router.get(`${this.path}/:id/toggleVisibility`, hasAllPermissions(['task_visibility']), this.tasksController.toggleVisibility);

    this.router.get(`${this.path}/list`, hasAllPermissions(['task_view_all']), this.tasksController.list);

    this.router.put(
      `${this.path}/:id/update`,
      hasAllPermissions(['task_edit']),
      validationMiddleware(UpdateTaskDto, 'body'),
      this.tasksController.update,
    );

    this.router.put(`${this.path}/:id/like`, hasAllPermissions(['task_submit']), this.tasksController.like);

    this.router.put(`${this.path}/:id/dislike`, hasAllPermissions(['task_submit']), this.tasksController.dislike);

    this.router.put(
      `${this.path}/reorder`,
      hasAllPermissions(['task_reorder']),
      validationMiddleware(TaskReorderDto, 'body'),
      this.tasksController.rerorder,
    );

    this.router.get(`${this.path}/:id/userTask`, hasAllPermissions(['task_view']), this.tasksController.getUserTask);

    this.router.get(`${this.path}/next`, hasAllPermissions(['task_view']), this.tasksController.getNext);

    this.router.get(`${this.path}/progress`, hasAllPermissions(['task_submit']), this.tasksController.getProgress);

    this.router.post(
      `${this.path}/:id/submitWithValidation`,
      hasAllPermissions(['task_submit']),
      validationMiddleware(TaskSubmitWithValidationDto, 'body'),
      this.tasksController.submitWithValidation,
    );

    this.router.post(
      `${this.path}/:id/submit`,
      hasAllPermissions(['task_submit']),
      validationMiddleware(TaskSubmitDto, 'body'),
      this.tasksController.submit,
    );

    this.router.get(`${this.path}/score`, hasAllPermissions(['task_submit']), this.tasksController.getScore);
  }
}

export default TasksRoute;
