import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import {
  TaskDto,
  UserTaskResultDto,
  TaskSubmitDto,
  TaskSubmitResultDto,
  TaskSubmitWithValidationDto,
  UserTaskDto,
  CreateTaskDto,
  UpdateTaskDto,
  TaskListDto,
  TaskFeedbackDto,
} from '@dtos/tasks.dto';
import glService from './gl.service';
import taskRepository from '@dataAccess/tasks.repository';
import { TaskModel, UserTaskModel } from '@dataAccess/models/task.model';
import { logger } from '@utils/logger';
import { User } from '@/interfaces/users.interface';
import amazonFileStorage from './amazonFileStorage';
import { TaskNameNotUniqueException } from '@/exceptions/TaskNameNotUniqueException';
import userRepository from '@/dataAccess/users.repository';
import tempStorage from './tempStorage';

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
        defaultVertexShader: task.vertexShader,
        defaultFragmentShader: task.defaultFragmentShader,
        description: task.description,
      },
    });

    if (taskId < 0) {
      throw new HttpException(500, 'Task create error');
    }

    const channels = task.channels || [];
    for (let i = 0; i < channels.length; i++) {
      const fileId = channels[i].file;
      const file = await tempStorage.get(fileId);
      await amazonFileStorage.save(`Tasks/${taskId}`, `channel_${i}`, file);
      await taskRepository.addTaskChannel({ Task_Id: taskId, Index: i });
      await tempStorage.remove(fileId);
    }

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
        defaultVertexShader: task.vertexShader,
        defaultFragmentShader: task.defaultFragmentShader,
        description: task.description,
      },
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
      await amazonFileStorage.save(`Tasks/${task.id}`, `channel_${i}`, file);
      await tempStorage.remove(fileId);
    }

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

    return {
      id: task.Id,
      moduleId: task.Module_Id,
      name: task.Name,
      vertexShader: task.Data?.vertexShader,
      fragmentShader: task.Data?.fragmentShader,
      defaultVertexShader: task.Data?.defaultVertexShader,
      defaultFragmentShader: task.Data?.defaultFragmentShader,
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
    };
  }

  public async getTaskChannel(taskId: number, index: number): Promise<Buffer> {
    const channel = await amazonFileStorage.get(`Tasks/${taskId}`, `channel_${index}`);
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

  public async getUserModuleTaskResults(userId: number, moduleId: number): Promise<UserTaskResultDto[]> {
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
      locked: currentTask && task.Order > currentTask.Order && task.Accepted != 1,
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
      accepted: task.Accepted > 0,
      rejected: task.Rejected > 0,
      match: task.Score / task.Cost,
      locked: false,
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

    return {
      task,
      vertexShader: userTask?.Data?.vertexShader || task.defaultVertexShader,
      fragmentShader: userTask?.Data?.fragmentShader || task.defaultFragmentShader,
      defaultFragmentShader: task.defaultFragmentShader,
      liked: userTask?.Liked === 1,
      disliked: userTask?.Liked === 0,
    };
  }

  public async submitTaskWithValidation(userId: number, taskSubmitData: TaskSubmitWithValidationDto): Promise<TaskSubmitResultDto> {
    if (isEmpty(taskSubmitData) || isEmpty(taskSubmitData.fragmentShader)) throw new HttpException(400, 'Task data is empty');

    const task = await this.getTask(taskSubmitData.id);

    const userTexture = glService.renderToTexture(taskSubmitData.vertexShader, taskSubmitData.fragmentShader, 256, 256);
    if (!userTexture) {
      const result: TaskSubmitResultDto = { accepted: false, score: 0, match: 0 };
      await this.setTaskSubmitionResult(userId, task.id, 0, false, taskSubmitData.vertexShader, taskSubmitData.fragmentShader);
      return result;
    }

    const taskTexture = glService.renderToTexture(task.vertexShader, task.fragmentShader, 256, 256);
    if (!taskTexture) {
      throw new HttpException(500, 'Task render issue');
    }

    let matches = 0;
    for (let i = 0; i < 256 * 256; i++) {
      const index = i * 4;
      if (
        userTexture[index + 0] == taskTexture[index + 0] &&
        userTexture[index + 1] == taskTexture[index + 1] &&
        userTexture[index + 2] == taskTexture[index + 2] &&
        userTexture[index + 3] == taskTexture[index + 3]
      ) {
        matches++;
      }
    }

    const matchDegree = matches / (256 * 256);
    const score = matchDegree * task.cost;
    const match = matchDegree;
    const accepted = match * 100 >= task.threshold;

    const result: TaskSubmitResultDto = { accepted, score, match };
    await this.setTaskSubmitionResult(userId, task.id, score, accepted, taskSubmitData.vertexShader, taskSubmitData.fragmentShader);
    return result;
  }

  public async submitTask(user: User, taskSubmitData: TaskSubmitDto): Promise<TaskSubmitResultDto> {
    if (isEmpty(taskSubmitData) || isEmpty(taskSubmitData.fragmentShader)) throw new HttpException(400, 'Task data is empty');

    const task = await this.getTask(taskSubmitData.id);
    let score = Math.round(taskSubmitData.match * task.cost);
    const match = taskSubmitData.match;
    const accepted = match * 100 >= task.threshold;
    const result: TaskSubmitResultDto = { accepted, score, match };

    const userTask = await taskRepository.findUserTask(user.id, task.id);
    if (userTask) {
      score = Math.max(result.score, userTask.Score);
    }

    await this.setTaskSubmitionResult(
      user.id,
      task.id,
      score,
      accepted || (!!userTask && userTask.Accepted == 1),
      taskSubmitData.vertexShader,
      taskSubmitData.fragmentShader,
    );

    return result;
  }

  private async setTaskSubmitionResult(
    userId: number,
    taskId: number,
    score: number,
    accepted: boolean,
    vertexShader: string,
    fragmentShader: string,
  ): Promise<boolean> {
    const userTaskToSave: UserTaskModel = {
      User_Id: userId,
      Task_Id: taskId,
      Score: score,
      Accepted: accepted ? 1 : 0,
      Rejected: accepted ? 0 : 1,
      Data: {
        vertexShader,
        fragmentShader,
      },
    };

    const userTask = await taskRepository.findUserTask(userId, taskId);

    let saved = false;
    if (userTask) {
      saved = await taskRepository.updateUserTask(userTaskToSave);
    } else {
      saved = await taskRepository.createUserTask(userTaskToSave);
    }

    if (!saved) {
      throw new HttpException(500, 'Task submition is not saved');
    }

    return saved;
  }

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
