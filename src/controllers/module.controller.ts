import { NextFunction, Response } from 'express';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';
import { CreateModuleDto, ModuleDto, ModuleListDto, ModuleUserProgressDto, UpdateModuleDto } from '@/dtos/modules.dto';
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

  public get = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const moduleId: number = parseInt(req.params.id);
      const task: ModuleDto = await moduleService.getModule(moduleId);

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const results: ModuleListDto[] = await moduleService.getModuleList();

      res.status(200).json(results);
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
      const moduleId: number = parseInt(req.params.id);
      const moduleProgress: ModuleUserProgressDto = await moduleService.getUserProgress(userData.id, moduleId);

      res.status(200).json(moduleProgress);
    } catch (error) {
      next(error);
    }
  };
}

export default ModuleController;
