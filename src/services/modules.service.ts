import { HttpException } from '@exceptions/HttpException';
import userRepository from '@/dataAccess/users.repository';
import { CreateModuleDto, ModuleDto, ModuleListDto, ModuleUserProgressDto, UpdateModuleDto } from '@/dtos/modules.dto';
import moduleRepository from '@/dataAccess/modules.repository';
import { ModuleNameNotUniqueException } from '@/exceptions/ModuleNameNotUniqueException';
import { ModuleModel } from '@/dataAccess/models/module.model';
import taskService from './tasks.service';

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
    });

    if (moduleId < 0) {
      throw new HttpException(500, 'Module create error');
    }

    return moduleId;
  }

  public async updateModule(module: UpdateModuleDto): Promise<number> {
    const findModule = await moduleRepository.findByName(module.name);
    if (findModule && findModule.Id != module.id) throw new ModuleNameNotUniqueException(module.name);

    const result = await moduleRepository.updateModule({
      Id: module.id,
      Name: module.name,
      Description: module.description,
      CreatedBy: findModule.CreatedBy,
      Order: findModule.Order,
      Locked: module.locked ? 1 : 0,
    });

    if (!result) {
      throw new HttpException(500, 'Module update error');
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
    };
  }

  public async getUserProgress(userId: number, moduleId: number): Promise<ModuleUserProgressDto> {
    const module: ModuleModel = await moduleRepository.findById(moduleId);
    if (module == null) {
      throw new HttpException(404, `Module with id=${moduleId} doesn't exist`);
    }

    const user = await userRepository.findUserById(module.CreatedBy);
    const tasks = await taskService.getUserModuleTaskResults(userId, moduleId);

    return {
      id: module.Id,
      name: module.Name,
      description: module.Description,
      order: module.Order,
      createdBy: { id: user.Id, name: user.UserName },
      locked: module.Locked == 1,
      tasks,
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
    }));
  }

  public async reorderTasks(moduleId: number, oldOrder: number, newOrder: number): Promise<boolean> {
    return await moduleRepository.rerderTasks(moduleId, oldOrder, newOrder);
  }
}

const moduleService = new ModulesService();
export default moduleService;
