import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import {
  TaskDto,
  UserTaskResultDto,
  TaskSubmitDto,
  TaskSubmitResultDto,
  UserTaskDto,
  CreateTaskDto,
  UpdateTaskDto,
  TaskListDto,
  TaskFeedbackDto,
  TaskLinterRule,
} from '@dtos/tasks.dto';
import taskRepository from '@dataAccess/tasks.repository';
import { TaskModel, UserTaskModel, UserTaskSubmissionModel } from '@dataAccess/models/task.model';
import { User } from '@/interfaces/users.interface';
import amazonFileStorage from './amazonFileStorage';
import { TaskNameNotUniqueException } from '@/exceptions/TaskNameNotUniqueException';
import userRepository from '@/dataAccess/users.repository';
import tempStorage from './tempStorage';
import { Utils } from './utils';

class TaskService {
  public async createTask(task: CreateTaskDto, userId: number): Promise<number> {
    const findTask = await taskRepository.findByName(task.name);
    if (findTask) throw new TaskNameNotUniqueException(task.name);

    let order = await taskRepository.getLastTaskOrder(task.moduleId);
    order++;

    const taskId = await taskRepository.createTask({
      Id: -1,
      Module_Id: task.moduleId,
      Name: task.name,
      Threshold: task.threshold,
      Order: order,
      Cost: task.cost,
      Visibility: task.visibility ? 1 : 0,
      CreatedBy: userId,
      Animated: task.animated ? 1 : 0,
      AnimationSteps: task.animationSteps,
      AnimationStepTime: task.animationStepTime,
      Data: {
        vertexShader: task.vertexShader,
        fragmentShader: task.fragmentShader,
        defaultVertexShader: task.defaultVertexShader,
        defaultFragmentShader: task.defaultFragmentShader,
        description: task.description,
        sceneSettings: task.sceneSettings,
      },
      VertexCodeEditable: task.vertexCodeEditable ? 1 : 0,
      FragmentCodeEditable: task.fragmentCodeEditable ? 1 : 0,
    });

    if (taskId < 0) {
      throw new HttpException(500, 'Task create error');
    }

    const channels = task.channels || [];
    for (let i = 0; i < channels.length; i++) {
      const fileId = channels[i].file;
      const file = await tempStorage.get(fileId);
      await amazonFileStorage.save(`Tasks/${taskId}/channel_${i}`, file);
      await taskRepository.addTaskChannel({ Task_Id: taskId, Index: i });
      await tempStorage.remove(fileId);
    }

    await Promise.all(
      (task.rules || []).map(async rule => {
        await taskRepository.addTaskLinterRule({
          Id: -1,
          Task_Id: taskId,
          Keyword: rule.keyword,
          Message: rule.message,
          Severity: rule.severity,
        });
      }),
    );

    return taskId;
  }

  public async updateTask(task: UpdateTaskDto): Promise<number> {
    let findTask = await taskRepository.findByName(task.name);
    if (findTask && findTask.Id != task.id) throw new TaskNameNotUniqueException(task.name);

    if (!findTask || findTask.Id != task.id) {
      findTask = await taskRepository.findById(task.id);
    }

    const result = await taskRepository.updateTask({
      Id: task.id,
      Module_Id: task.moduleId,
      Name: task.name,
      Threshold: task.threshold,
      Order: findTask.Order,
      Cost: task.cost,
      Visibility: task.visibility ? 1 : 0,
      CreatedBy: findTask.CreatedBy,
      Animated: task.animated ? 1 : 0,
      AnimationSteps: task.animationSteps,
      AnimationStepTime: task.animationStepTime,
      Data: {
        vertexShader: task.vertexShader,
        fragmentShader: task.fragmentShader,
        defaultVertexShader: task.defaultVertexShader,
        defaultFragmentShader: task.defaultFragmentShader,
        description: task.description,
        sceneSettings: task.sceneSettings,
      },
      VertexCodeEditable: task.vertexCodeEditable ? 1 : 0,
      FragmentCodeEditable: task.fragmentCodeEditable ? 1 : 0,
    });

    if (!result) {
      throw new HttpException(500, 'Task update error');
    }

    const oldChannels = await taskRepository.getTaskChannels(task.id);
    const newChannels = task.channels || [];

    for (let i = newChannels.length; i < oldChannels.length; i++) {
      await taskRepository.removeTaskChannel(oldChannels[i]);
    }

    for (let i = oldChannels.length; i < newChannels.length; i++) {
      await taskRepository.addTaskChannel({ Task_Id: task.id, Index: i });
    }

    for (let i = 0; i < newChannels.length; i++) {
      const fileId = newChannels[i].file;
      const file = await tempStorage.get(fileId);
      await amazonFileStorage.save(`Tasks/${task.id}/channel_${i}`, file);
      await tempStorage.remove(fileId);
    }

    const newRules = task.rules;
    const oldRules = await taskRepository.getTaskOwnedLinterRules(task.id);
    const rulesToRemove = oldRules.filter(oldRule => newRules.every(newRule => newRule.id != oldRule.Id));
    const rulesToCreate = newRules.filter(rule => !rule.id);
    const rulesToUpdate = newRules
      .filter(rule => rule.id)
      .map(rule => [rule, oldRules.find(it => it.Id == rule.id)])
      .filter(([a, b]) => JSON.stringify(a) != JSON.stringify(b))
      .map(([rule]) => rule as TaskLinterRule);

    await Promise.all(
      rulesToCreate.map(
        async rule =>
          await taskRepository.addTaskLinterRule({
            Id: -1,
            Task_Id: task.id,
            Keyword: rule.keyword,
            Message: rule.message,
            Severity: rule.severity,
          }),
      ),
    );

    await Promise.all(
      rulesToUpdate.map(
        async rule =>
          await taskRepository.updateTaskLinterRule({
            Id: rule.id,
            Task_Id: task.id,
            Keyword: rule.keyword,
            Message: rule.message,
            Severity: rule.severity,
          }),
      ),
    );

    await Promise.all(rulesToRemove.map(async rule => await taskRepository.removeTaskLinterRule(rule.Id)));

    return task.id;
  }

  public async toggleTaskVisibility(id: number): Promise<boolean> {
    const findTask = await taskRepository.findById(id);
    if (!findTask) throw new HttpException(404, 'Task not found');

    findTask.Visibility = findTask.Visibility == 0 ? 1 : 0;
    const result = await taskRepository.updateTask(findTask);

    if (!result) {
      throw new HttpException(500, 'Task update error');
    }

    return findTask.Visibility == 1;
  }

  public async getTask(id: number): Promise<TaskDto> {
    const task: TaskModel = await taskRepository.findById(id);
    if (task == null) {
      throw new HttpException(404, `Task with id=${id} doesn't exist`);
    }

    const likes = await this.getLikesNumber(id);
    const dislikes = await this.getDislikesNumber(id);

    const user = await userRepository.findUserById(task.CreatedBy);
    const channels = await taskRepository.getTaskChannels(task.Id);
    const rules = await taskRepository.getTaskLinterRules(task.Id);

    return {
      id: task.Id,
      moduleId: task.Module_Id,
      name: task.Name,
      vertexShader: task.Data?.vertexShader,
      fragmentShader: task.Data?.fragmentShader,
      defaultVertexShader: task.Data?.defaultVertexShader,
      defaultFragmentShader: task.Data?.defaultFragmentShader,
      vertexCodeEditable: task.VertexCodeEditable == 1,
      fragmentCodeEditable: task.FragmentCodeEditable == 1,
      sceneSettings: task.Data?.sceneSettings,
      description: task.Data?.description,
      hints: [],
      restrictions: [],
      order: task.Order,
      cost: task.Cost,
      threshold: task.Threshold,
      likes,
      dislikes,
      visibility: task.Visibility == 1,
      createdBy: { id: user.Id, name: user.UserName },
      channels: channels.map(c => ({ index: c.Index })),
      animated: task.Animated == 1,
      animationSteps: task.AnimationSteps,
      animationStepTime: task.AnimationStepTime,
      rules: rules.map(rule => ({
        id: rule.Id,
        default: rule.Task_Id == null,
        keyword: rule.Keyword,
        message: rule.Message,
        severity: rule.Severity,
      })),
    };
  }

  public async getTaskChannel(taskId: number, index: number): Promise<Buffer> {
    const channel = await amazonFileStorage.get(`Tasks/${taskId}/channel_${index}`);
    return channel;
  }

  public async getModuleTaskList(moduleId: number): Promise<TaskListDto[]> {
    const tasks = await taskRepository.getModuleTaskList(moduleId);

    return tasks.map(task => ({
      id: task.Id,
      moduleId: task.Module_Id,
      name: task.Name,
      order: task.Order,
      threshold: task.Threshold,
      cost: task.Cost,
      visibility: task.Visibility == 1,
    }));
  }

  public async getUserModuleTaskResults(userId: number, moduleId: number, randomAccess: boolean): Promise<UserTaskResultDto[]> {
    const tasks = await taskRepository.getUserModuleTaskResults(userId, moduleId);
    const currentTask = tasks.find(it => !it.Accepted);

    return tasks.map(task => ({
      id: task.Id,
      moduleId: task.Module_Id,
      name: task.Name,
      order: task.Order,
      score: task.Score,
      accepted: task.Accepted > 0,
      rejected: task.Rejected > 0,
      match: task.Score / task.Cost,
      locked: !randomAccess && currentTask && task.Order > currentTask.Order && task.Accepted != 1,
    }));
  }

  public async getTaskList(): Promise<TaskListDto[]> {
    const tasks = await taskRepository.getTaskList();

    return tasks.map(task => ({
      id: task.Id,
      moduleId: task.Module_Id,
      name: task.Name,
      order: task.Order,
      threshold: task.Threshold,
      cost: task.Cost,
      visibility: task.Visibility == 1,
    }));
  }

  public async getUserTaskResults(userId: number): Promise<UserTaskResultDto[]> {
    const tasks = await taskRepository.getUserTaskResults(userId);

    return tasks.map(task => ({
      id: task.Id,
      moduleId: task.Module_Id,
      name: task.Name,
      order: task.Order,
      score: task.Score,
      accepted: task.Accepted == 1,
      rejected: task.Rejected == 1,
      match: task.Score / task.Cost,
      locked: true,
    }));
  }

  public async getUserTaskResultsForMe(userId: number, myId: number): Promise<UserTaskResultDto[]> {
    const tasks = await taskRepository.getUserTaskResultsForMe(userId, myId);

    return tasks.map(task => ({
      id: task.Id,
      moduleId: task.Module_Id,
      name: task.Name,
      order: task.Order,
      score: task.Score,
      accepted: task.Accepted == 1,
      rejected: task.Rejected == 1,
      match: task.Score / task.Cost,
      locked: task.Locked == 1,
    }));
  }

  public async getNextTaskForUser(userId: number): Promise<UserTaskDto> {
    const task: TaskModel = await taskRepository.findNext(userId);
    if (!task) {
      return null;
    }

    return this.getTaskForUser(userId, task.Id);
  }

  public async getTaskForUser(userId: number, taskId: number): Promise<UserTaskDto> {
    const task: TaskDto = await this.getTask(taskId);
    if (!task) {
      return null;
    }

    const userTask: UserTaskModel = await taskRepository.findUserTask(userId, taskId);
    const submissions: UserTaskSubmissionModel[] = await taskRepository.getUserTaskSubmissions(userId, taskId);

    const vertexShader = task.vertexCodeEditable && userTask?.Data?.vertexShader ? userTask?.Data?.vertexShader : task.defaultVertexShader;
    const fragmentShader = task.fragmentCodeEditable && userTask?.Data?.fragmentShader ? userTask?.Data?.fragmentShader : task.defaultFragmentShader;

    return {
      task,
      vertexShader,
      fragmentShader,
      defaultVertexShader: task.defaultVertexShader,
      defaultFragmentShader: task.defaultFragmentShader,
      liked: userTask?.Liked === 1,
      disliked: userTask?.Liked === 0,
      accepted: userTask?.Accepted === 1,
      submissions: submissions.map(it => ({
        score: it.Score,
        accepted: it.Accepted == 1,
        vertexShader: task.vertexCodeEditable && it.Data?.vertexShader ? it.Data?.vertexShader : task.defaultVertexShader,
        fragmentShader: task.fragmentCodeEditable && it.Data?.fragmentShader ? it.Data?.fragmentShader : task.defaultFragmentShader,
        at: it.At,
      })),
    };
  }

  // public async submitTaskWithValidation(userId: number, taskSubmitData: TaskSubmitWithValidationDto): Promise<TaskSubmitResultDto> {
  //   if (isEmpty(taskSubmitData) || isEmpty(taskSubmitData.fragmentShader)) throw new HttpException(400, 'Task data is empty');

  //   const task = await this.getTask(taskSubmitData.id);

  //   const userTexture = glService.renderToTexture(taskSubmitData.vertexShader, taskSubmitData.fragmentShader, 256, 256);
  //   if (!userTexture) {
  //     const result: TaskSubmitResultDto = { accepted: false, score: 0, match: 0 };
  //     await this.setTaskSubmitionResult(userId, task.id, 0, false, taskSubmitData.vertexShader, taskSubmitData.fragmentShader);
  //     return result;
  //   }

  //   const taskTexture = glService.renderToTexture(task.vertexShader, task.fragmentShader, 256, 256);
  //   if (!taskTexture) {
  //     throw new HttpException(500, 'Task render issue');
  //   }

  //   let matches = 0;
  //   for (let i = 0; i < 256 * 256; i++) {
  //     const index = i * 4;
  //     if (
  //       userTexture[index + 0] == taskTexture[index + 0] &&
  //       userTexture[index + 1] == taskTexture[index + 1] &&
  //       userTexture[index + 2] == taskTexture[index + 2] &&
  //       userTexture[index + 3] == taskTexture[index + 3]
  //     ) {
  //       matches++;
  //     }
  //   }

  //   const matchDegree = matches / (256 * 256);
  //   const score = matchDegree * task.cost;
  //   const match = matchDegree;
  //   const accepted = match * 100 >= task.threshold;

  //   const result: TaskSubmitResultDto = { accepted, score, match };
  //   await this.setTaskSubmitionResult(userId, task.id, score, accepted, taskSubmitData.vertexShader, taskSubmitData.fragmentShader);
  //   return result;
  // }

  public async submitTask(user: User, taskSubmitData: TaskSubmitDto): Promise<TaskSubmitResultDto> {
    if (isEmpty(taskSubmitData) || isEmpty(taskSubmitData.fragmentShader)) throw new HttpException(400, 'Task data is empty');

    const task = await this.getTask(taskSubmitData.id);
    const score = Math.round(taskSubmitData.match * task.cost);
    const match = taskSubmitData.match;
    const accepted = match * 100 >= task.threshold;
    const at = new Date();

    const userTaskToSave: UserTaskModel = {
      User_Id: user.id,
      Task_Id: task.id,
      Score: score,
      Accepted: accepted ? 1 : 0,
      Rejected: accepted ? 0 : 1,
      Data: {
        vertexShader: task.vertexCodeEditable ? taskSubmitData.vertexShader : null,
        fragmentShader: task.fragmentCodeEditable ? taskSubmitData.fragmentShader : null,
      },
      AcceptedAt: accepted ? Utils.asUTC(at) : null,
    };

    const userTask = await taskRepository.findUserTask(user.id, task.id);
    if (!!userTask && userTask.Accepted) {
      userTaskToSave.Score = Math.max(score, userTask.Score);
      userTaskToSave.Accepted = 1;
      userTaskToSave.Rejected = 0;
      userTaskToSave.AcceptedAt = userTask.AcceptedAt;
    }

    await taskRepository.saveUserTaskSubmission({
      User_Id: user.id,
      Task_Id: task.id,
      Score: score,
      Accepted: accepted ? 1 : 0,
      Data: {
        vertexShader: task.vertexCodeEditable ? taskSubmitData.vertexShader : null,
        fragmentShader: task.fragmentCodeEditable ? taskSubmitData.fragmentShader : null,
      },
      At: Utils.asUTC(at),
    });

    if (userTask) {
      await taskRepository.updateUserTask(userTaskToSave);
    } else {
      await taskRepository.createUserTask(userTaskToSave);
    }

    const moduleTask = await taskRepository.getNextModuleTask(user.id, task.id);

    const result: TaskSubmitResultDto = {
      accepted,
      acceptedPreviously: userTask && userTask.Accepted == 1,
      statusChanged: !userTask || userTask.Accepted !== userTaskToSave.Accepted,
      score,
      match,
      at,
      vertexShader: task.vertexCodeEditable ? taskSubmitData.vertexShader : task.vertexShader,
      fragmentShader: task.fragmentCodeEditable ? taskSubmitData.fragmentShader : task.fragmentShader,
      moduleFinished: task.moduleId != moduleTask?.Module_Id,
      nextTaskId: moduleTask?.Id,
      nextModuleId: moduleTask?.Module_Id,
    };
    return result;
  }

  // private async setTaskSubmitionResult(
  //   userId: number,
  //   taskId: number,
  //   score: number,
  //   accepted: boolean,
  //   vertexShader: string,
  //   fragmentShader: string,
  // ): Promise<boolean> {
  //   const userTaskToSave: UserTaskModel = {
  //     User_Id: userId,
  //     Task_Id: taskId,
  //     Score: score,
  //     Accepted: accepted ? 1 : 0,
  //     Rejected: accepted ? 0 : 1,
  //     Data: {
  //       vertexShader,
  //       fragmentShader,
  //     },
  //     AcceptedAt: accepted ? Utils.getUTC() : null,
  //   };

  //   const userTask = await taskRepository.findUserTask(userId, taskId);

  //   let saved = false;
  //   if (userTask) {
  //     saved = await taskRepository.updateUserTask(userTaskToSave);
  //   } else {
  //     saved = await taskRepository.createUserTask(userTaskToSave);
  //   }

  //   await taskRepository.saveUserTaskSubmission({
  //     User_Id: userId,
  //     Task_Id: taskId,
  //     Score: score,
  //     Accepted: accepted ? 1 : 0,
  //     Data: {
  //       vertexShader,
  //       fragmentShader,
  //     },
  //     At: Utils.getUTC(),
  //   });

  //   if (!saved) {
  //     throw new HttpException(500, 'Task submition is not saved');
  //   }

  //   return saved;
  // }

  public async getUserScore(userId: number): Promise<number> {
    const score: number = await taskRepository.getUserScore(userId);
    return score;
  }

  public async like(userId: number, taskId: number, value: boolean): Promise<boolean> {
    const userTask = await taskRepository.findUserTask(userId, taskId);
    if (!userTask) {
      await taskRepository.createUserTask({
        User_Id: userId,
        Task_Id: taskId,
        Score: 0,
        Accepted: 0,
        Rejected: 0,
        Data: null,
        AcceptedAt: null,
      });
    }

    return await taskRepository.setLiked(userId, taskId, value || null);
  }

  public async dislike(userId: number, taskId: number, value: boolean): Promise<boolean> {
    const userTask = await taskRepository.findUserTask(userId, taskId);
    if (!userTask) {
      await taskRepository.createUserTask({
        User_Id: userId,
        Task_Id: taskId,
        Score: 0,
        Accepted: 0,
        Rejected: 0,
        Data: null,
        AcceptedAt: null,
      });
    }

    return await taskRepository.setLiked(userId, taskId, value ? false : null);
  }

  public async getLikesNumber(taskId: number): Promise<number> {
    return await taskRepository.getLikes(taskId);
  }

  public async getDislikesNumber(taskId: number): Promise<number> {
    return await taskRepository.getDislikes(taskId);
  }

  public async saveFeedback(userId: number, taskId: number, feedback: TaskFeedbackDto): Promise<boolean> {
    return await taskRepository.saveFeedback({
      User_Id: userId,
      Task_Id: taskId,
      UnclearDescription: feedback.unclearDescription ? 1 : 0,
      StrictRuntime: feedback.strictRuntime ? 1 : 0,
      Other: feedback.other ? 1 : 0,
      Message: feedback.message,
    });
  }
}

const taskService = new TaskService();
export default taskService;
