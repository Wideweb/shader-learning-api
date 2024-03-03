import { HttpException } from '@exceptions/HttpException';
import userRepository from '@/dataAccess/users.repository';
import { CreateModuleDto, ModuleDto, ModuleListDto, ModuleUserProgressDto, UpdateModuleDto, UserModuleListDto } from '@/dtos/modules.dto';
import moduleRepository from '@/dataAccess/modules.repository';
import { ModuleNameNotUniqueException } from '@/exceptions/ModuleNameNotUniqueException';
import { ModuleModel } from '@/dataAccess/models/module.model';
import taskService from './tasks.service';
import amazonFileStorage from './amazonFileStorage';
import tempStorage from './tempStorage';

class ModulesService {
  public async createModule(module: CreateModuleDto, userId: number): Promise<number> {
    const findModule = await moduleRepository.findByName(module.name);
    if (findModule) throw new ModuleNameNotUniqueException(module.name);

    let order = await moduleRepository.getLastModuleOrder();
    order++;

    const moduleId = await moduleRepository.createModule({
      Id: -1,
      Name: module.name,
      Description: module.description,
      CreatedBy: userId,
      Order: order,
      Locked: module.locked ? 1 : 0,
      Cover: module.cover ? 1 : 0,
      PageHeaderImage: module.pageHeaderImage ? 1 : 0,
      RandomTaskAccess: 0,
    });

    if (moduleId < 0) {
      throw new HttpException(500, 'Module create error');
    }

    if (module.cover) {
      const file = await tempStorage.get(module.cover);
      await amazonFileStorage.save(`Modules/${moduleId}/cover`, file);
      await tempStorage.remove(module.cover);
    }

    if (module.pageHeaderImage) {
      const file = await tempStorage.get(module.pageHeaderImage);
      await amazonFileStorage.save(`Modules/${moduleId}/page-header`, file);
      await tempStorage.remove(module.pageHeaderImage);
    }

    return moduleId;
  }

  public async updateModule(module: UpdateModuleDto): Promise<number> {
    let findModule = await moduleRepository.findByName(module.name);
    if (findModule && findModule.Id != module.id) throw new ModuleNameNotUniqueException(module.name);

    if (!findModule || findModule.Id != module.id) {
      findModule = await moduleRepository.findById(module.id);
    }

    const result = await moduleRepository.updateModule({
      Id: module.id,
      Name: module.name,
      Description: module.description,
      CreatedBy: findModule.CreatedBy,
      Order: findModule.Order,
      Locked: module.locked ? 1 : 0,
      Cover: module.cover ? 1 : 0,
      PageHeaderImage: module.pageHeaderImage ? 1 : 0,
      RandomTaskAccess: findModule.RandomTaskAccess,
    });

    if (!result) {
      throw new HttpException(500, 'Module update error');
    }

    if (module.cover) {
      const file = await tempStorage.get(module.cover);
      await amazonFileStorage.save(`Modules/${module.id}/cover`, file);
      await tempStorage.remove(module.cover);
    }

    if (module.pageHeaderImage) {
      const file = await tempStorage.get(module.pageHeaderImage);
      await amazonFileStorage.save(`Modules/${module.id}/page-header`, file);
      await tempStorage.remove(module.pageHeaderImage);
    }

    return module.id;
  }

  public async getModule(id: number): Promise<ModuleDto> {
    const module: ModuleModel = await moduleRepository.findById(id);
    if (module == null) {
      throw new HttpException(404, `Module with id=${id} doesn't exist`);
    }

    const user = await userRepository.findUserById(module.CreatedBy);
    const tasks = await taskService.getModuleTaskList(id);

    return {
      id: module.Id,
      name: module.Name,
      description: module.Description,
      order: module.Order,
      createdBy: { id: user.Id, name: user.UserName },
      locked: module.Locked == 1,
      tasks,
      cover: module.Cover == 1,
      pageHeaderImage: module.PageHeaderImage == 1,
      randomTaskAccess: module.RandomTaskAccess == 1,
    };
  }

  public async getUserProgress(userId: number, moduleId: number): Promise<ModuleUserProgressDto> {
    const module: ModuleModel = await moduleRepository.findById(moduleId);
    if (module == null) {
      throw new HttpException(404, `Module with id=${moduleId} doesn't exist`);
    }

    const user = await userRepository.findUserById(module.CreatedBy);
    const tasks = await taskService.getUserModuleTaskResults(userId, moduleId, module.RandomTaskAccess == 1);

    return {
      id: module.Id,
      name: module.Name,
      description: module.Description,
      order: module.Order,
      createdBy: { id: user.Id, name: user.UserName },
      locked: module.Locked == 1,
      tasks,
      cover: module.Cover == 1,
      pageHeaderImage: module.PageHeaderImage == 1,
    };
  }

  public async getModuleList(): Promise<ModuleListDto[]> {
    const modules = await moduleRepository.getModuleList();

    return modules.map(module => ({
      id: module.Id,
      name: module.Name,
      description: module.Description,
      tasks: module.Tasks,
      order: module.Order,
      locked: module.Locked == 1,
      cover: module.Cover == 1,
    }));
  }

  public async getUserModuleList(userId: number): Promise<UserModuleListDto[]> {
    const modules = await moduleRepository.getUserModuleList(userId);

    return modules.map(module => ({
      id: module.Id,
      name: module.Name,
      description: module.Description,
      tasks: module.Tasks,
      acceptedTasks: module.AcceptedTasks,
      order: module.Order,
      locked: module.Locked == 1,
      cover: module.Cover == 1,
    }));
  }

  public async toggleLock(moduleId: number): Promise<boolean> {
    const module: ModuleModel = await moduleRepository.findById(moduleId);
    if (module == null) {
      throw new HttpException(404, `Module with id=${moduleId} doesn't exist`);
    }

    module.Locked = module.Locked == 0 ? 1 : 0;
    const result = await moduleRepository.updateModule(module);

    if (!result) {
      throw new HttpException(500, 'Module lock update error');
    }

    return module.Locked == 1;
  }

  public async updateName(moduleId: number, name: string): Promise<boolean> {
    let module = await moduleRepository.findByName(name);
    if (module && module.Id != moduleId) throw new ModuleNameNotUniqueException(name);

    module = await moduleRepository.findById(moduleId);
    if (module == null) {
      throw new HttpException(404, `Module with id=${moduleId} doesn't exist`);
    }

    module.Name = name;
    const result = await moduleRepository.updateModule(module);

    if (!result) {
      throw new HttpException(500, 'Module name update error');
    }

    return true;
  }

  public async updateDescription(moduleId: number, description: string): Promise<boolean> {
    const module: ModuleModel = await moduleRepository.findById(moduleId);
    if (module == null) {
      throw new HttpException(404, `Module with id=${moduleId} doesn't exist`);
    }

    module.Description = description;
    const result = await moduleRepository.updateModule(module);

    if (!result) {
      throw new HttpException(500, 'Module description update error');
    }

    return true;
  }

  public async updateCover(moduleId: number, fileId: string): Promise<boolean> {
    const module: ModuleModel = await moduleRepository.findById(moduleId);
    if (module == null) {
      throw new HttpException(404, `Module with id=${moduleId} doesn't exist`);
    }

    if (fileId) {
      const file = await tempStorage.get(fileId);
      await amazonFileStorage.save(`Modules/${module.Id}/cover`, file);
      await tempStorage.remove(fileId);
      module.Cover = 1;
    } else {
      module.Cover = 0;
    }

    const result = await moduleRepository.updateModule(module);

    if (!result) {
      throw new HttpException(500, 'Module description update error');
    }

    return true;
  }

  public async getCover(moduleId: number): Promise<Buffer> {
    const channel = await amazonFileStorage.get(`Modules/${moduleId}/cover`);
    return channel;
  }

  public async updatePageHeaderImage(moduleId: number, fileId: string): Promise<boolean> {
    const module: ModuleModel = await moduleRepository.findById(moduleId);
    if (module == null) {
      throw new HttpException(404, `Module with id=${moduleId} doesn't exist`);
    }

    if (fileId) {
      const file = await tempStorage.get(fileId);
      await amazonFileStorage.save(`Modules/${module.Id}/page-header`, file);
      await tempStorage.remove(fileId);
      module.PageHeaderImage = 1;
    } else {
      module.PageHeaderImage = 0;
    }

    const result = await moduleRepository.updateModule(module);

    if (!result) {
      throw new HttpException(500, 'Module description update error');
    }

    return true;
  }

  public async getPageHeaderImage(moduleId: number): Promise<Buffer> {
    const file = await amazonFileStorage.get(`Modules/${moduleId}/page-header`);
    return file;
  }

  public async reorderTasks(moduleId: number, oldOrder: number, newOrder: number): Promise<boolean> {
    return await moduleRepository.rerderTasks(moduleId, oldOrder, newOrder);
  }
}

const moduleService = new ModulesService();
export default moduleService;
