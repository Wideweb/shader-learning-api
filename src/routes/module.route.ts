import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { hasAllPermissions } from '@/middlewares/auth.middleware';
import ModuleController from '@/controllers/module.controller';
import { CreateModuleDto, ModuleTaskReorderDto, UpdateModuleDto } from '@/dtos/modules.dto';

class ModuleRoute implements Routes {
  public path = '/modules';
  public router = Router();
  public controller = new ModuleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      hasAllPermissions(['module_create']),
      validationMiddleware(CreateModuleDto, 'body'),
      this.controller.create,
    );

    this.router.get(`${this.path}/:id/get`, hasAllPermissions(['module_view']), this.controller.get);

    this.router.get(`${this.path}/list`, hasAllPermissions(['module_view_all']), this.controller.list);

    this.router.put(
      `${this.path}/:id/update`,
      hasAllPermissions(['module_edit']),
      validationMiddleware(UpdateModuleDto, 'body'),
      this.controller.update,
    );

    this.router.get(`${this.path}/:id/tasks/list`, hasAllPermissions(['module_view']), this.controller.taskList);

    this.router.put(
      `${this.path}/:id/tasks/reorder`,
      hasAllPermissions(['task_reorder']),
      validationMiddleware(ModuleTaskReorderDto, 'body'),
      this.controller.taskReorder,
    );
  }
}

export default ModuleRoute;
