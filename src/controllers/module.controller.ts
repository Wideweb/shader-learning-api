import { NextFunction, Response } from 'express';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';
import {
  CreateModuleDto,
  ModuleDto,
  ModuleListDto,
  ModuleUserProgressDto,
  UpdateModuleCoverDto,
  UpdateModuleDescriptionDto,
  UpdateModuleDto,
  UpdateModuleNameDto,
  UpdateModulePageHeaderImageDto,
} from '@/dtos/modules.dto';
import moduleService from '@/services/modules.service';
import taskService from '@/services/tasks.service';

class ModuleController {
  public create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const moduleData: CreateModuleDto = req.body;

      const id = await moduleService.createModule(moduleData, userData.id);
      res.status(200).json(id);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleData: UpdateModuleDto = req.body;
      const id = await moduleService.updateModule(moduleData);

      res.status(200).json(id);
    } catch (error) {
      next(error);
    }
  };

  public updateName = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const payload: UpdateModuleNameDto = req.body;
      const id = await moduleService.updateName(moduleId, payload.name);

      res.status(200).json(id);
    } catch (error) {
      next(error);
    }
  };

  public updateDescription = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const payload: UpdateModuleDescriptionDto = req.body;
      const id = await moduleService.updateDescription(moduleId, payload.description);

      res.status(200).json(id);
    } catch (error) {
      next(error);
    }
  };

  public updateCover = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const payload: UpdateModuleCoverDto = req.body;
      const id = await moduleService.updateCover(moduleId, payload.file);

      res.status(200).json(id);
    } catch (error) {
      next(error);
    }
  };

  public getCover = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const buffer = await moduleService.getCover(moduleId);

      res.setHeader('Cross-Origin-Resource-Policy', '*');
      res.setHeader('Cross-Origin-Opener-Policy', '*');
      res.setHeader('Cross-Origin-Embedder-Policy', '*');
      res.writeHead(200, { 'Content-Type': 'image/*' });
      res.end(buffer);
    } catch (error) {
      next(error);
    }
  };

  public updatePageHeaderImage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const payload: UpdateModulePageHeaderImageDto = req.body;
      const id = await moduleService.updatePageHeaderImage(moduleId, payload.file);

      res.status(200).json(id);
    } catch (error) {
      next(error);
    }
  };

  public getPageHeaderImage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const buffer = await moduleService.getPageHeaderImage(moduleId);

      res.setHeader('Cross-Origin-Resource-Policy', '*');
      res.setHeader('Cross-Origin-Opener-Policy', '*');
      res.setHeader('Cross-Origin-Embedder-Policy', '*');
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      res.end(buffer);
    } catch (error) {
      next(error);
    }
  };

  public get = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const module: ModuleDto = await moduleService.getModule(moduleId);

      res.status(200).json(module);
    } catch (error) {
      next(error);
    }
  };

  public view = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const module: ModuleDto = await moduleService.getModule(moduleId);

      const userData: User = req.user;
      const canEditModule = userData && userData.permissions.some(p => p == 'module_edit');

      if (module.locked && !canEditModule) {
        res.status(403).json(null);
        return;
      }

      const canEditTask = userData && userData.permissions.some(p => p == 'task_edit');
      if (!canEditTask) {
        module.tasks = module.tasks.filter(task => task.visibility);
      }

      res.status(200).json(module);
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;

      if (userData) {
        const results: ModuleListDto[] = await moduleService.getUserModuleList(userData.id);
        const canEditModule = userData.permissions.some(p => p == 'module_edit');
        res.status(200).json(results.filter(m => !m.locked || canEditModule));
      } else {
        const results: ModuleListDto[] = await moduleService.getModuleList();
        res.status(200).json(results.filter(m => !m.locked));
      }
    } catch (error) {
      next(error);
    }
  };

  public toggleLock = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const result = await moduleService.toggleLock(moduleId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public taskList = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const tasks = await taskService.getModuleTaskList(moduleId);

      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  };

  public taskReorder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const oldOrder: number = parseInt(req.body.oldOrder);
      const newOrder: number = parseInt(req.body.newOrder);

      const result = await moduleService.reorderTasks(moduleId, oldOrder, newOrder);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public userProgress = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const canEditModule = userData && userData.permissions.some(p => p == 'module_edit');

      const moduleId: number = parseInt(req.params.id);
      const moduleProgress: ModuleUserProgressDto = await moduleService.getUserProgress(userData.id, moduleId);

      if (moduleProgress.locked && !canEditModule) {
        res.status(403).json(null);
        return;
      }

      res.status(200).json(moduleProgress);
    } catch (error) {
      next(error);
    }
  };
}

export default ModuleController;
