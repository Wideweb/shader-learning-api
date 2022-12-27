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
} from '@dtos/tasks.dto';
import glService from './gl.service';
import taskRepository from '@dataAccess/tasks.repository';
import { TaskModel, UserTaskModel } from '@dataAccess/models/task.model';
import { logger } from '@utils/logger';
import { User } from '@/interfaces/users.interface';
import amazonFileStorage from './amazonFileStorage';
import { TaskNameNotUniqueException } from '@/exceptions/TaskNameNotUniqueException';
import userRepository from '@/dataAccess/users.repository';

class TaskService {
  public async createTask(task: CreateTaskDto, userId: number): Promise<number> {
    const findTask = await taskRepository.findByName(task.name);
    if (findTask) throw new TaskNameNotUniqueException(task.name);

    let order = await taskRepository.getLastTaskOrder();
    order++;

    const taskId = await taskRepository.createTask({
      Id: -1,
      Name: task.name,
      Threshold: task.threshold,
      Order: order,
      Cost: task.cost,
      Visibility: task.visibility ? 0 : 1,
      CreatedBy: userId,
    });

    if (taskId < 0) {
      throw new HttpException(500, 'Task create error');
    }

    await amazonFileStorage.save(`Tasks/${taskId}`, 'vertex.glsl', task.vertexShader);
    await amazonFileStorage.save(`Tasks/${taskId}`, 'fragment.glsl', task.fragmentShader);
    await amazonFileStorage.save(`Tasks/${taskId}`, 'description.md', task.description);

    return taskId;
  }

  public async updateTask(task: UpdateTaskDto): Promise<number> {
    const findTask = await taskRepository.findByName(task.name);
    if (findTask && findTask.Id != task.id) throw new TaskNameNotUniqueException(task.name);

    const result = await taskRepository.updateTask({
      Id: task.id,
      Name: task.name,
      Threshold: task.threshold,
      Order: task.order,
      Cost: task.cost,
      Visibility: task.visibility ? 0 : 1,
      CreatedBy: findTask.CreatedBy,
    });

    if (!result) {
      throw new HttpException(500, 'Task update error');
    }

    await amazonFileStorage.save(`Tasks/${task.id}`, 'vertex.glsl', task.vertexShader);
    await amazonFileStorage.save(`Tasks/${task.id}`, 'fragment.glsl', task.fragmentShader);
    await amazonFileStorage.save(`Tasks/${task.id}`, 'description.md', task.description);

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

    const vertexBuffer = await amazonFileStorage.get(`Tasks/${task.Id}`, 'vertex.glsl');
    const fragmentBuffer = await amazonFileStorage.get(`Tasks/${task.Id}`, 'fragment.glsl');
    const descriptionBuffer = await amazonFileStorage.get(`Tasks/${task.Id}`, 'description.md');

    const user = await userRepository.findUserById(task.CreatedBy);

    return {
      id: task.Id,
      name: task.Name,
      vertexShader: vertexBuffer ? vertexBuffer.toString() : '',
      fragmentShader: fragmentBuffer ? fragmentBuffer.toString() : '',
      description: descriptionBuffer ? descriptionBuffer.toString() : '',
      hints: [],
      restrictions: [],
      order: task.Order,
      cost: task.Cost,
      threshold: task.Threshold,
      likes,
      dislikes,
      visibility: task.Visibility == 1,
      createdBy: { id: user.Id, name: user.UserName },
    };
  }

  public async getTaskList(): Promise<TaskListDto[]> {
    const tasks = await taskRepository.getTaskList();

    return tasks.map(task => ({
      id: task.Id,
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
      name: task.Name,
      order: task.Order,
      score: task.Score,
      accepted: task.Accepted > 0,
      rejected: task.Rejected > 0,
    }));
  }

  public async getNextTaskForUser(userId: number): Promise<UserTaskDto> {
    let task: TaskModel = await taskRepository.findNotAccepted(userId);
    if (!task) {
      task = await taskRepository.findNext(userId);
    }

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

    const vertexBuffer = await amazonFileStorage.get(`Users/${userId}/tasks/${taskId}`, 'vertex.glsl');
    const fragmentBuffer = await amazonFileStorage.get(`Users/${userId}/tasks/${taskId}`, 'fragment.glsl');

    return {
      task,
      vertexShader: vertexBuffer ? vertexBuffer.toString() : null,
      fragmentShader: fragmentBuffer ? fragmentBuffer.toString() : null,
      liked: userTask?.Liked === true,
      disliked: userTask?.Liked === false,
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
    const match = matchDegree * 100;
    const accepted = match >= task.threshold;

    const result: TaskSubmitResultDto = { accepted, score, match };
    await this.setTaskSubmitionResult(userId, task.id, score, accepted, taskSubmitData.vertexShader, taskSubmitData.fragmentShader);
    return result;
  }

  public async submitTask(user: User, taskSubmitData: TaskSubmitDto): Promise<TaskSubmitResultDto> {
    if (isEmpty(taskSubmitData) || isEmpty(taskSubmitData.fragmentShader)) throw new HttpException(400, 'Task data is empty');

    const task = await this.getTask(taskSubmitData.id);
    const score = Math.round(taskSubmitData.match * task.cost);
    const match = taskSubmitData.match * 100;
    const accepted = match >= task.threshold;
    const result: TaskSubmitResultDto = { accepted, score, match };

    const userTask = await taskRepository.findUserTask(user.id, task.id);
    if (!userTask || userTask.Score < score) {
      await this.setTaskSubmitionResult(user.id, task.id, score, accepted, taskSubmitData.vertexShader, taskSubmitData.fragmentShader);
    }

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
    };

    const userTask = await taskRepository.findUserTask(userId, taskId);

    let saved = false;
    if (userTask) {
      saved = await taskRepository.updateUserTask(userTaskToSave);
    } else {
      saved = await taskRepository.createUserTask(userTaskToSave);
    }

    await amazonFileStorage.save(`Users/${userId}/tasks/${taskId}`, 'vertex.glsl', vertexShader);
    await amazonFileStorage.save(`Users/${userId}/tasks/${taskId}`, 'fragment.glsl', fragmentShader);

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
      });
    }

    return await taskRepository.setLiked(userId, taskId, value ? false : null);
  }

  public async reorder(oldOrder: number, newOrder: number): Promise<boolean> {
    return await taskRepository.rerder(oldOrder, newOrder);
  }

  public async getLikesNumber(taskId: number): Promise<number> {
    return await taskRepository.getLikes(taskId);
  }

  public async getDislikesNumber(taskId: number): Promise<number> {
    return await taskRepository.getDislikes(taskId);
  }
}

const taskService = new TaskService();
export default taskService;
