import { Utils } from '@/services/utils';
import { logger } from '@/utils/logger';
import dbConnection from './db-connection';
import {
  TaskChannelModel,
  TaskDataModel,
  TaskFeedbackModel,
  TaskLinterRule,
  TaskListModel,
  TaskModel,
  UserTaskDataModel,
  UserTaskModel,
  UserTaskResultModel,
  UserTaskSubmissionModel,
} from './models/task.model';

export class TaskRepository {
  public async getAll(): Promise<TaskModel[]> {
    const result = await dbConnection.query<TaskModel>(`SELECT * FROM Tasks`);
    return result;
  }

  public async updateData(taskId: number, data: TaskDataModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE Tasks
        SET 
          Data = :Data
        WHERE 
          Id = ${taskId};
      `,
        { Data: JSON.stringify(data) },
      );
      return true;
    } catch (err) {
      logger.error(`TaskRepository::updateData | taskId:${taskId}; error:${err.message}`);
      return false;
    }
  }

  public async getAllUserTasks(): Promise<UserTaskModel[]> {
    const result = await dbConnection.query<TaskModel>(`SELECT * FROM UserTask`);
    return result;
  }

  public async updateUserTaskData(userId: number, taskId: number, data: UserTaskDataModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE UserTask
        SET 
          Data = :Data
        WHERE 
          User_Id = ${userId} AND Task_Id = ${taskId};
      `,
        { Data: JSON.stringify(data) },
      );
      return true;
    } catch (err) {
      logger.error(`TaskRepository::updateUserTaskData | userId:${userId}; taskId:${taskId}; error:${err.message}`);
      return false;
    }
  }

  public async findById(id: number): Promise<TaskModel> {
    try {
      const result = await dbConnection.query<TaskModel>(`SELECT * FROM Tasks WHERE Id = :id LIMIT 1`, { id });
      return result[0];
    } catch (err) {
      logger.error(`TaskRepository::findById | id: ${id}; error: ${err.message}`);
      return null;
    }
  }

  public async findByName(name: string): Promise<TaskModel> {
    try {
      const result = await dbConnection.query<TaskModel>(`SELECT * FROM Tasks WHERE Name = :name LIMIT 1`, { name });
      return result[0];
    } catch (err) {
      logger.error(`TaskRepository::findByName | name: ${name}; error: ${err.message}`);
      return null;
    }
  }

  public async getLastTaskOrder(moduleId: number): Promise<number> {
    try {
      const result = await dbConnection.query<number>(
        `
      SELECT Tasks.Order as \`Order\`
      FROM Tasks
      WHERE Tasks.Module_Id = :moduleId
      ORDER BY Tasks.Order DESC
      LIMIT 1
    `,
        { moduleId },
      );
      const order = Number.parseInt(result[0] ? result[0]['Order'] : -1);
      return Number.isNaN(order) ? -1 : order;
    } catch (err) {
      logger.error(`TaskRepository::getLastTaskOrder | moduleId: ${moduleId}; error: ${err.message}`);
      return -1;
    }
  }

  public async createTask(task: TaskModel): Promise<number> {
    try {
      const result = await dbConnection.query(
        `
        INSERT INTO Tasks (Name, Threshold, \`Order\`, Cost, Visibility, Module_Id, CreatedBy, Animated, AnimationSteps, AnimationStepTime, Data, VertexCodeEditable, FragmentCodeEditable)
        VALUES (:Name, :Threshold, :Order, :Cost, :Visibility, :Module_Id, :CreatedBy, :Animated, :AnimationSteps, :AnimationStepTime, :Data, :VertexCodeEditable, :FragmentCodeEditable);
      `,
        { ...task, Data: JSON.stringify(task.Data) },
      );
      return result.insertId;
    } catch (err) {
      logger.error(
        `TaskRepository::createTask | Name:${task.Name}; Threshold:${task.Threshold}; Order:${task.Order}; Cost:${task.Cost}; error:${err.message}`,
      );
      return -1;
    }
  }

  public async updateTask(task: TaskModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE Tasks
        SET 
          Name = :Name,
          Threshold = :Threshold,
          \`Order\` = :Order,
          Cost = :Cost,
          Visibility = :Visibility,
          Animated = :Animated,
          AnimationSteps = :AnimationSteps,
          AnimationStepTime = :AnimationStepTime,
          Data = :Data,
          VertexCodeEditable = :VertexCodeEditable,
          FragmentCodeEditable = :FragmentCodeEditable
        WHERE 
          Id = ${task.Id};
      `,
        { ...task, Data: JSON.stringify(task.Data) },
      );
      return true;
    } catch (err) {
      logger.error(
        `TaskRepository::updateTask | Name:${task.Name}; Threshold:${task.Threshold}; Order:${task.Order}; Cost:${task.Cost}; error:${err.message}`,
      );
      return false;
    }
  }

  public async getTaskChannels(taskId: number): Promise<TaskChannelModel[]> {
    try {
      const result = await dbConnection.query<TaskChannelModel>(
        `
      SELECT *
      FROM TaskChannels
      WHERE TaskChannels.Task_Id = :taskId
    `,
        { taskId },
      );
      return result;
    } catch (err) {
      logger.error(`TaskRepository::addTaskChannel | taskId: ${taskId}; error: ${err.message}`);
      return [];
    }
  }

  public async addTaskChannel(channel: TaskChannelModel): Promise<boolean> {
    try {
      const result = await dbConnection.query(
        `
      INSERT INTO TaskChannels (Task_Id, \`Index\`)
      VALUES (:Task_Id, :Index);
    `,
        { ...channel },
      );
      return result;
    } catch (err) {
      logger.error(`TaskRepository::addTaskChannel | taskId: ${channel.Task_Id}; index: ${channel.Index}; error: ${err.message}`);
      return false;
    }
  }

  public async removeTaskChannel(channel: TaskChannelModel): Promise<boolean> {
    try {
      const result = await dbConnection.query(
        `
      DELETE FROM TaskChannels
      WHERE Task_Id = :Task_Id AND \`Index\` = :Index
    `,
        { ...channel },
      );
      return result;
    } catch (err) {
      logger.error(`TaskRepository::removeTaskChannel | taskId: ${channel.Task_Id}; index: ${channel.Index}; error: ${err.message}`);
      return false;
    }
  }

  public async getTaskLinterRules(taskId: number): Promise<TaskLinterRule[]> {
    try {
      const result = await dbConnection.query<TaskChannelModel>(
        `
      SELECT *
      FROM TaskLinterRules
      WHERE TaskLinterRules.Task_Id = :taskId OR TaskLinterRules.Task_Id IS NULL
    `,
        { taskId },
      );
      return result;
    } catch (err) {
      logger.error(`TaskRepository::getTaskLinterRules | taskId: ${taskId}; error: ${err.message}`);
      return [];
    }
  }

  public async getTaskOwnedLinterRules(taskId: number): Promise<TaskLinterRule[]> {
    try {
      const result = await dbConnection.query<TaskChannelModel>(
        `
      SELECT *
      FROM TaskLinterRules
      WHERE TaskLinterRules.Task_Id = :taskId
    `,
        { taskId },
      );
      return result;
    } catch (err) {
      logger.error(`TaskRepository::getTaskOwnedLinterRules | taskId: ${taskId}; error: ${err.message}`);
      return [];
    }
  }

  public async addTaskLinterRule(rule: TaskLinterRule): Promise<boolean> {
    try {
      const result = await dbConnection.query(
        `
      INSERT INTO TaskLinterRules (Task_Id, Keyword, Message, Severity)
      VALUES (:Task_Id, :Keyword, :Message, :Severity);
    `,
        { ...rule },
      );
      return result;
    } catch (err) {
      logger.error(
        `TaskRepository::addTaskLinterRule | id: ${rule.Id}; keyword: ${rule.Keyword}; message: ${rule.Message}; severity: ${rule.Severity}; error: ${err.message}`,
      );
      return false;
    }
  }

  public async updateTaskLinterRule(rule: TaskLinterRule): Promise<boolean> {
    try {
      const result = await dbConnection.query(
        `
      UPDATE TaskLinterRules
        SET 
          Keyword = :Keyword,
          Message = :Message,
          Severity = :Severity
        WHERE 
          Id = :Id
    `,
        { ...rule },
      );
      return result;
    } catch (err) {
      logger.error(
        `TaskRepository::updateTaskLinterRule | id: ${rule.Id}; keyword: ${rule.Keyword}; message: ${rule.Message}; severity: ${rule.Severity}; error: ${err.message}`,
      );
      return false;
    }
  }

  public async removeTaskLinterRule(id: number): Promise<boolean> {
    try {
      const result = await dbConnection.query(
        `
      DELETE FROM TaskLinterRules
      WHERE Id = :id
    `,
        { id },
      );
      return result;
    } catch (err) {
      logger.error(`TaskRepository::removeTaskLinterRule | id: ${id}; error: ${err.message}`);
      return false;
    }
  }

  public async getLikes(taskId: number): Promise<number> {
    try {
      const result = await dbConnection.query<number>(
        `
      SELECT COUNT (*) as \`Count\`
      FROM
          UserTask
      WHERE
          UserTask.Liked = 1 AND UserTask.Task_Id = :taskId
    `,
        { taskId },
      );
      return result[0]['Count'] || 0;
    } catch (err) {
      logger.error(`TaskRepository::getLikes | taskId: ${taskId}; error: ${err.message}`);
      return 0;
    }
  }

  public async getDislikes(taskId: number): Promise<number> {
    try {
      const result = await dbConnection.query<number>(
        `
      SELECT COUNT (*) as \`Count\`
      FROM
          UserTask
      WHERE
          UserTask.Liked = 0 AND UserTask.Task_Id = :taskId
    `,
        { taskId },
      );
      return result[0]['Count'] || 0;
    } catch (err) {
      logger.error(`TaskRepository::getDislikes | taskId: ${taskId}; error: ${err.message}`);
      return 0;
    }
  }

  public async getModuleTaskList(moduleId: number): Promise<TaskListModel[]> {
    try {
      const result = await dbConnection.query<TaskListModel>(
        `
      SELECT Tasks.Id, Tasks.Name, Tasks.Order, Tasks.Threshold, Tasks.Cost, Tasks.Visibility
      FROM Tasks
      WHERE Tasks.Module_Id = :moduleId
      ORDER BY Tasks.Order
      LIMIT 100
    `,
        { moduleId },
      );
      return result;
    } catch (err) {
      logger.error(`TaskRepository::getModuleTaskList | error: ${err.message}`);
      return [];
    }
  }

  public async getTaskList(): Promise<TaskListModel[]> {
    try {
      const result = await dbConnection.query<TaskListModel>(`
      SELECT
        Tasks.Id,
        Tasks.Name,
        Tasks.Order,
        Tasks.Threshold,
        Tasks.Cost,
        Tasks.Visibility,
        Tasks.Module_Id
      FROM Tasks
      ORDER BY Tasks.Order
      LIMIT 100
    `);
      return result;
    } catch (err) {
      logger.error(`TaskRepository::getTaskList | error: ${err.message}`);
      return [];
    }
  }

  public async createUserTask(task: UserTaskModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
          INSERT INTO UserTask (User_Id, Task_Id, Score, Accepted, Rejected, Data, AcceptedAt)
          VALUES (:User_Id, :Task_Id, :Score, :Accepted, :Rejected, :Data, :AcceptedAt);
      `,
        { ...task, Data: JSON.stringify(task.Data) },
      );
      return true;
    } catch (err) {
      logger.error(`TaskRepository::createUserTask | 
      userId:${task.User_Id}; 
      taskId:${task.Task_Id}; 
      score:${task.Score}; 
      accepted:${task.Accepted}; 
      rejected:${task.Rejected}; 
      data: ${task.Data ? '[Data]' : 'null'};
      error:${err.message}`);
      return false;
    }
  }

  public async updateUserTask(task: UserTaskModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
          UPDATE UserTask
          SET 
            Score = :Score, Accepted = :Accepted, Rejected = :Rejected, Data = :Data, AcceptedAt = :AcceptedAt
          WHERE 
            User_Id = :User_Id AND Task_Id = :Task_Id;
      `,
        { ...task, Data: JSON.stringify(task.Data) },
      );
      return true;
    } catch (err) {
      logger.error(`TaskRepository::updateUserTask | 
      userId:${task.User_Id}; 
      taskId:${task.Task_Id}; 
      score:${task.Score}; 
      rejected:${task.Rejected}; 
      accepted:${task.Accepted}; 
      data: ${task.Data ? '[Data]' : 'null'};
      acceptedAt:${task.AcceptedAt}; 
      error:${err.message}`);
      return false;
    }
  }

  public async saveUserTaskSubmission(task: UserTaskSubmissionModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
          INSERT INTO UserTaskSubmissions (User_Id, Task_Id, Score, Accepted, Data, At)
          VALUES (:User_Id, :Task_Id, :Score, :Accepted, :Data, :At);
      `,
        { ...task, Data: JSON.stringify(task.Data) },
      );
      return true;
    } catch (err) {
      logger.error(`TaskRepository::saveUserTaskSubmission | 
      userId:${task.User_Id}; 
      taskId:${task.Task_Id}; 
      score:${task.Score}; 
      accepted:${task.Accepted}; 
      data: ${task.Data ? '[Data]' : 'null'};
      at:${task.At}; 
      error:${err.message}`);
      return false;
    }
  }

  public async setLiked(userId: number, taskId: number, value: boolean | null): Promise<boolean> {
    let liked: number | null = null;
    if (value === true) {
      liked = 1;
    }

    if (value === false) {
      liked = 0;
    }

    try {
      await dbConnection.query(
        `
        UPDATE UserTask
        SET 
          Liked = :liked
        WHERE 
          User_Id = :userId AND Task_Id = :taskId;
      `,
        { liked, userId, taskId },
      );
      return true;
    } catch (err) {
      logger.error(`TaskRepository::setLiked | userId:${userId}; taskId:${taskId}; value:${value}; error:${err.message}`);
      return false;
    }
  }

  public async findUserTask(userId: number, taskId: number): Promise<UserTaskModel> {
    try {
      const result = await dbConnection.query<UserTaskModel>(
        `
      SELECT *
      FROM
          UserTask
      WHERE
          UserTask.User_Id = :userId AND UserTask.Task_Id = :taskId
      LIMIT 1
    `,
        { userId, taskId },
      );
      return result[0] && result[0].At ? { ...result[0], AcceptedAt: Utils.addTimezoneOffset(result[0].At) } : result[0];
    } catch (err) {
      logger.error(`TaskRepository::findUserTask | userId:${userId}; taskId:${taskId}; error:${err.message}`);
      return null;
    }
  }

  public async getUserTaskSubmissions(userId: number, taskId: number): Promise<UserTaskSubmissionModel[]> {
    try {
      const result = await dbConnection.query<UserTaskSubmissionModel[]>(
        `
      SELECT *
      FROM
        UserTaskSubmissions
      WHERE
        UserTaskSubmissions.User_Id = :userId AND UserTaskSubmissions.Task_Id = :taskId
      ORDER BY
        UserTaskSubmissions.At DESC
    `,
        { userId, taskId },
      );
      return (result || []).map(it => ({ ...it, At: Utils.addTimezoneOffset(it.At) }));
    } catch (err) {
      logger.error(`TaskRepository::getUserTaskSubmissions | userId:${userId}; taskId:${taskId}; error:${err.message}`);
      return [];
    }
  }

  public async getUserTaskResults(userId: number): Promise<UserTaskResultModel[]> {
    try {
      const result = await dbConnection.query<UserTaskResultModel>(
        `
      SELECT
        Tasks.Id,
        Tasks.Module_Id,
        Tasks.Name,
        Tasks.Order,
        Tasks.Cost,
        UserTask.Score,
        UserTask.Accepted,
        UserTask.Rejected
      FROM
          UserTask
      INNER JOIN Tasks ON UserTask.Task_Id = Tasks.Id
      WHERE
          UserTask.User_Id = :userId AND Tasks.Visibility = 1
      ORDER BY
        CASE WHEN AcceptedAt IS NOT NULL THEN AcceptedAt ELSE (
          SELECT UserTaskSubmissions.At FROM UserTaskSubmissions
          WHERE UserTaskSubmissions.Task_Id = Tasks.Id AND UserTaskSubmissions.User_Id = :userId
          ORDER BY UserTaskSubmissions.At ASC
          LIMIT 1
        ) END ASC
    `,
        { userId },
      );
      return result;
    } catch (err) {
      logger.error(`TaskRepository::getUserTaskResults | userId:${userId}; error:${err.message}`);
      return [];
    }
  }

  public async getUserTaskResultsForMe(userId: number, myId: number): Promise<UserTaskResultModel[]> {
    try {
      const result = await dbConnection.query<UserTaskResultModel>(
        `
      SELECT
        Tasks.Id,
        Tasks.Module_Id,
        Tasks.Name,
        Tasks.Order,
        Tasks.Cost,
        UserTask.Score,
        UserTask.Accepted,
        UserTask.Rejected,
        IF(Tasks.Order = 0, 0, IF(ISNULL(myUserTask.Task_Id), 1, 0)) AS \`Locked\`
      FROM
        UserTask
      INNER JOIN Tasks ON UserTask.Task_Id = Tasks.Id
      LEFT JOIN UserTask myUserTask ON myUserTask.User_Id = :myId AND myUserTask.Task_Id = Tasks.Id
      WHERE
        UserTask.User_Id = :userId AND Tasks.Visibility = 1
      ORDER BY
      CASE WHEN UserTask.AcceptedAt IS NOT NULL THEN UserTask.AcceptedAt ELSE (
        SELECT UserTaskSubmissions.At FROM UserTaskSubmissions
        WHERE UserTaskSubmissions.Task_Id = UserTask.Task_Id AND UserTaskSubmissions.User_Id = :userId
        ORDER BY UserTaskSubmissions.At ASC
        LIMIT 1
      ) END ASC
    `,
        { userId, myId },
      );
      return result;
    } catch (err) {
      logger.error(`TaskRepository::getUserTaskResultsForMe | userId:${userId}; myId:${myId}; error:${err.message}`);
      return [];
    }
  }

  public async getUserModuleTaskResults(userId: number, moduleId: number): Promise<UserTaskResultModel[]> {
    try {
      const result = await dbConnection.query<UserTaskResultModel>(
        `
      SELECT 
        Tasks.Id,
        Tasks.Module_Id,
        Tasks.Name,
        Tasks.Order,
        Tasks.Cost,
        IFNULL(UserTask.Score, 0) AS Score,
        IFNULL(UserTask.Accepted, 0) as Accepted,
        IFNULL(UserTask.Rejected, 0) as Rejected
      FROM
          Tasks
      LEFT JOIN UserTask ON Tasks.Id = UserTask.Task_Id AND UserTask.User_Id = :userId
      WHERE
          Tasks.Module_Id = :moduleId AND Tasks.Visibility = 1
      ORDER BY Tasks.Order
    `,
        { userId, moduleId },
      );
      return result;
    } catch (err) {
      logger.error(`TaskRepository::getUserModuleTaskResults | userId:${userId}; moduleId:${moduleId}; error:${err.message}`);
      return [];
    }
  }

  public async findNext(userId: number): Promise<TaskModel> {
    try {
      const result = await dbConnection.query<TaskModel>(
        `
        SELECT
            Tasks.*
        FROM
            Tasks
        LEFT JOIN UserTask ON Tasks.Id = UserTask.Task_Id
        WHERE
            Tasks.Visibility = 1 AND 
            (
                (UserTask.User_Id IS NULL) OR
                (UserTask.User_Id = :userId AND UserTask.Accepted = 0)
            )
        ORDER BY Tasks.Order
    `,
        { userId },
      );
      return result[0];
    } catch (err) {
      logger.error(`TaskRepository::findNext | userId:${userId}; error:${err.message}`);
      return null;
    }
  }

  public async getUserScore(userId: number): Promise<number> {
    try {
      const result = await dbConnection.query<number>(
        `
      SELECT SUM(UserTask.Score) as \`UserScore\`
      FROM
          UserTask
      INNER JOIN Tasks ON UserTask.Task_Id = Tasks.Id
      WHERE
          UserTask.User_Id = :userId AND UserTask.Accepted = 1 AND Tasks.Visibility = 1
    `,
        { userId },
      );
      return result[0]['UserScore'] || 0;
    } catch (err) {
      logger.error(`TaskRepository::getUserScore | userId:${userId}; error:${err.message}`);
      return 0;
    }
  }

  public async saveFeedback(feedback: TaskFeedbackModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        INSERT INTO TaskFeedback (User_Id, Task_Id, UnclearDescription, StrictRuntime, Other, Message)
        VALUES (:User_Id, :Task_Id, :UnclearDescription, :StrictRuntime, :Other, :Message);
      `,
        { ...feedback },
      );
      return true;
    } catch (err) {
      logger.error(
        `TaskRepository::saveFeedback | userId:${feedback.User_Id}; taskId:${feedback.Task_Id}; message:${feedback.Message}; error:${err.message}`,
      );
      return false;
    }
  }

  public async getNextModuleTask(userId: number, taskId: number): Promise<{ Id: number; Module_Id: number }> {
    try {
      const result = await dbConnection.query<number>(
        `
          SELECT Tasks.Id, Tasks.Module_Id
          FROM Tasks
          LEFT JOIN Tasks currTask ON currTask.Id = :taskId
          LEFT JOIN Modules currModule ON currModule.Id = currTask.Module_Id
          LEFT JOIN Modules taskModule ON taskModule.Id = Tasks.Module_Id
          LEFT JOIN UserTask ON UserTask.Task_Id = Tasks.Id AND UserTask.User_Id = :userId
          WHERE Tasks.Visibility = 1 AND (ISNULL(UserTask.Accepted) OR UserTask.Accepted != 1) AND taskModule.Order >= currModule.Order
          ORDER BY taskModule.Order, Tasks.Order
          LIMIT 1
      `,
        { userId, taskId },
      );
      return result[0];
    } catch (err) {
      logger.error(`TaskRepository::getNextModuleTask | userId:${userId}; error:${err.message}`);
      return null;
    }
  }
}

const taskRepository = new TaskRepository();
export default taskRepository;
