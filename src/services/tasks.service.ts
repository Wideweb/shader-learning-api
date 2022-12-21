import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { TaskDto, UserTaskResultDto, TaskSubmitDto, TaskSubmitResultDto, TaskSubmitWithValidationDto } from '@dtos/tasks.dto';
import glService from './gl.service';
import taskRepository from '@dataAccess/tasks.repository';
import { TaskModel, UserTaskModel } from '@dataAccess/models/task.model';
import fileSystem from 'fs';
import path from 'path';
import { logger } from '@utils/logger';

class TaskService {
  public async getTask(id: number): Promise<TaskDto> {
    const task: TaskModel = await taskRepository.findById(id);
    if (task == null) {
      throw new HttpException(404, "Task doesn't exist");
    }

    const { vertexShader, fragmentShader } = this.getTaskSources(task.Name);

    return {
      id: task.Id,
      vertexShader,
      fragmentShader,
      hints: [],
      restrictions: [],
      order: task.Order,
      cost: task.Cost,
      threshold: task.Threshold,
    };
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

  public async getNextTaskForUser(userId: number): Promise<TaskDto> {
    let task: TaskModel = await taskRepository.findNotAccepted(userId);
    if (!task) {
      task = await taskRepository.findNext(userId);
    }

    if (!task) {
      return null;
    }

    const { vertexShader, fragmentShader } = this.getTaskSources(task.Name);

    return {
      id: task.Id,
      vertexShader,
      fragmentShader,
      hints: [],
      restrictions: [],
      order: task.Order,
      cost: task.Cost,
      threshold: task.Threshold,
    };
  }

  public async submitTaskWithValidation(userId: number, taskSubmitData: TaskSubmitWithValidationDto): Promise<TaskSubmitResultDto> {
    if (isEmpty(taskSubmitData) || isEmpty(taskSubmitData.fragmentShader)) throw new HttpException(400, 'Task data is empty');

    const task = await this.getTask(taskSubmitData.id);

    const userTexture = glService.renderToTexture(taskSubmitData.vertexShader, taskSubmitData.fragmentShader, 256, 256);
    if (!userTexture) {
      const result: TaskSubmitResultDto = { accepted: false, score: 0, match: 0 };
      await this.setTaskSubmitionResult(userId, task.id, result);
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
    await this.setTaskSubmitionResult(userId, task.id, result);
    return result;
  }

  public async submitTask(userId: number, taskSubmitData: TaskSubmitDto): Promise<TaskSubmitResultDto> {
    if (isEmpty(taskSubmitData) || isEmpty(taskSubmitData.fragmentShader)) throw new HttpException(400, 'Task data is empty');

    const task = await this.getTask(taskSubmitData.id);
    const score = taskSubmitData.match * task.cost;
    const match = taskSubmitData.match * 100;
    const accepted = match >= task.threshold;

    const result: TaskSubmitResultDto = { accepted, score, match };
    await this.setTaskSubmitionResult(userId, task.id, result);
    return result;
  }

  public async setTaskSubmitionResult(userId: number, taskId: number, taskSubmitResult: TaskSubmitResultDto): Promise<boolean> {
    const userTaskToSave: UserTaskModel = {
      User_Id: userId,
      Task_Id: taskId,
      Score: taskSubmitResult.score,
      Accepted: taskSubmitResult.accepted ? 1 : 0,
      Rejected: taskSubmitResult.accepted ? 0 : 1,
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

  private getTaskSources(taskName: string): { vertexShader: string; fragmentShader: string } {
    try {
      const tasksFoder = '../resources/tasks';
      const vertexPath = path.resolve(__dirname, tasksFoder, taskName.toLowerCase(), `vertex.glsl`);
      const fragmentPath = path.resolve(__dirname, tasksFoder, taskName.toLowerCase(), `fragment.glsl`);

      const vertexShader = fileSystem.readFileSync(vertexPath, 'utf8');
      const fragmentShader = fileSystem.readFileSync(fragmentPath, 'utf8');

      return { vertexShader, fragmentShader };
    } catch (err) {
      throw new HttpException(404, `Task ${taskName} sources doesn't exist`);
    }
  }
}

const taskService = new TaskService();
export default taskService;
