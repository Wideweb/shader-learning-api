import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { hasAllPermissions } from '@/middlewares/auth.middleware';
import ModuleController from '@/controllers/module.controller';
import {
  CreateModuleDto,
  ModuleTaskReorderDto,
  UpdateModuleCoverDto,
  UpdateModuleDescriptionDto,
  UpdateModuleDto,
  UpdateModuleNameDto,
} from '@/dtos/modules.dto';

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

    this.router.get(`${this.path}/:id/get`, hasAllPermissions(['module_edit']), this.controller.get);

    this.router.get(`${this.path}/:id/view`, hasAllPermissions(['module_view']), this.controller.view);

    this.router.get(`${this.path}/list`, hasAllPermissions(['module_view']), this.controller.list);

    this.router.put(
      `${this.path}/:id/update`,
      hasAllPermissions(['module_edit']),
      validationMiddleware(UpdateModuleDto, 'body'),
      this.controller.update,
    );

    this.router.put(
      `${this.path}/:id/name`,
      hasAllPermissions(['module_edit']),
      validationMiddleware(UpdateModuleNameDto, 'body'),
      this.controller.updateName,
    );

    this.router.put(
      `${this.path}/:id/description`,
      hasAllPermissions(['module_edit']),
      validationMiddleware(UpdateModuleDescriptionDto, 'body'),
      this.controller.updateDescription,
    );

    this.router.get(`${this.path}/:id/cover`, hasAllPermissions(['module_view']), this.controller.getCover);

    this.router.put(
      `${this.path}/:id/cover`,
      hasAllPermissions(['module_edit']),
      validationMiddleware(UpdateModuleCoverDto, 'body'),
      this.controller.updateCover,
    );

    this.router.put(`${this.path}/:id/toggleLock`, hasAllPermissions(['module_edit']), this.controller.toggleLock);

    this.router.get(`${this.path}/:id/tasks/list`, hasAllPermissions(['module_view', 'task_view']), this.controller.taskList);

    this.router.put(
      `${this.path}/:id/tasks/reorder`,
      hasAllPermissions(['task_reorder']),
      validationMiddleware(ModuleTaskReorderDto, 'body'),
      this.controller.taskReorder,
    );

    this.router.get(`${this.path}/:id/user/progress`, hasAllPermissions(['module_view', 'task_submit']), this.controller.userProgress);
  }
}

export default ModuleRoute;
