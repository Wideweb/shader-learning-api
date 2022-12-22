import { logger } from '@/utils/logger';
import { query } from 'mssql';
import { TaskListModel, TaskModel, UserTaskModel, UserTaskResultModel } from './models/task.model';

export class TaskRepository {
  public async findById(id: number): Promise<TaskModel> {
    const result = await query<TaskModel>(`SELECT TOP (1) * FROM [dbo].[Tasks] WHERE [Id] = ${id}`);
    return result.recordset[0];
  }

  public async findByName(name: string): Promise<TaskModel> {
    const result = await query<TaskModel>(`SELECT TOP (1) * FROM [dbo].[Tasks] WHERE [Name] = '${name}'`);
    return result.recordset[0];
  }

  public async getLastTaskOrder(): Promise<number> {
    const result = await query<number>(`SELECT TOP 1 ([Order]) FROM [dbo].[Tasks] ORDER BY [Order] DESC`);
    return result.recordset[0][''] || 0;
  }

  public async createTask(task: TaskModel): Promise<number> {
    try {
      const result = await query(`
          INSERT INTO [dbo].[Tasks] ([Name], [Threshold], [Order], [Cost], [Visibility])
          VALUES ('${task.Name}', ${task.Threshold}, ${task.Order}, ${task.Cost}, ${task.Visibility});
          SELECT SCOPE_IDENTITY();
      `);
      return result.recordset[0][''];
    } catch (err) {
      logger.error(
        `DB: Failed to create task | Name:${task.Name}, Threshold:${task.Threshold}, Order:${task.Order}, Cost:${task.Cost}, error:${err.message}`,
      );
      return -1;
    }
  }

  public async updateTask(task: TaskModel): Promise<boolean> {
    try {
      await query(`
        UPDATE [dbo].[Tasks]
        SET 
          [Name] = '${task.Name}', [Threshold] = ${task.Threshold}, [Order] = ${task.Order}, [Cost] = ${task.Cost}, [Visibility] = ${task.Visibility}
        WHERE 
          [Id] = ${task.Id};
      `);
      return true;
    } catch (err) {
      logger.error(
        `DB: Failed to update task | Name:${task.Name}, Threshold:${task.Threshold}, Order:${task.Order}, Cost:${task.Cost}, error:${err.message}`,
      );
      return false;
    }
  }

  public async getTaskList(): Promise<TaskListModel[]> {
    const result = await query<TaskListModel>(`
      SELECT TOP(100) [dbo].[Tasks].[Id], [dbo].[Tasks].[Name], [dbo].[Tasks].[Order], [dbo].[Tasks].[Threshold], [dbo].[Tasks].[Cost], [dbo].[Tasks].[Visibility]
      FROM [dbo].[Tasks]
      ORDER BY [dbo].[Tasks].[Order]
    `);
    return result.recordset;
  }

  public async createUserTask(task: UserTaskModel): Promise<boolean> {
    try {
      await query(`
          INSERT INTO [dbo].[UserTask] ([User_Id], [Task_Id], [Score], [Accepted], [Rejected])
          VALUES ('${task.User_Id}', '${task.Task_Id}', '${task.Score}', '${task.Accepted}', '${task.Rejected}');
      `);
      return true;
    } catch {
      return false;
    }
  }

  public async updateUserTask(task: UserTaskModel): Promise<boolean> {
    try {
      await query(`
          UPDATE [dbo].[UserTask]
          SET 
            [Score] = ${task.Score}, [Accepted] = ${task.Accepted}, [Rejected] = ${task.Rejected}
          WHERE 
            [User_Id] = ${task.User_Id} AND [Task_Id] = ${task.Task_Id};
      `);
      return true;
    } catch {
      return false;
    }
  }

  public async findUserTask(userId: number, taskId: number): Promise<UserTaskModel> {
    const result = await query<UserTaskModel>(`
      SELECT TOP (1) *
      FROM
          [dbo].[UserTask]
      WHERE
          [dbo].[UserTask].[User_Id] = '${userId}' AND [dbo].[UserTask].[Task_Id] = '${taskId}'
    `);
    return result.recordset[0];
  }

  public async getUserTaskResults(userId: number): Promise<UserTaskResultModel[]> {
    const result = await query<UserTaskResultModel>(`
      SELECT [dbo].[Tasks].[Id], [dbo].[Tasks].[Name], [dbo].[Tasks].[Order], [dbo].[UserTask].[Score], [dbo].[UserTask].[Accepted], [dbo].[UserTask].[Rejected]
      FROM
          [dbo].[UserTask]
      INNER JOIN [dbo].[Tasks] ON [dbo].[UserTask].[Task_Id] = [dbo].[Tasks].[Id]
      WHERE
          [dbo].[UserTask].[User_Id] = '${userId}'
      ORDER BY [dbo].[Tasks].[Order]
    `);
    return result.recordset;
  }

  public async findNotAccepted(userId: number): Promise<TaskModel> {
    const result = await query<TaskModel>(`
      SELECT TOP (1)
          [dbo].[Tasks].*
      FROM
          [dbo].[UserTask]
      INNER JOIN [dbo].[Tasks] ON [dbo].[UserTask].[Task_Id] = [dbo].[Tasks].[Id]
      WHERE
          [dbo].[UserTask].[User_Id] = '${userId}' AND [dbo].[UserTask].[Accepted] = 0 AND [dbo].[Tasks].[Visibility] = 1
    `);
    return result.recordset[0];
  }

  public async findNext(userId: number): Promise<TaskModel> {
    const result = await query<TaskModel>(`
      SELECT TOP (1)
          [dbo].[Tasks].*
      FROM
          [dbo].[Tasks]
      LEFT JOIN [dbo].[UserTask] ON [dbo].[UserTask].[Task_Id] = [dbo].[Tasks].[Id] AND [dbo].[UserTask].[User_Id] = ${userId}
      WHERE
          [dbo].[UserTask].[Task_Id] IS NULL AND [dbo].[Tasks].[Visibility] = 1
    `);
    return result.recordset[0];
  }

  public async getUserScore(userId: number): Promise<number> {
    const result = await query<number>(`
      SELECT SUM ([dbo].[UserTask].[Score])
      FROM
          [dbo].[UserTask]
      INNER JOIN [dbo].[Tasks] ON [dbo].[UserTask].[Task_Id] = [dbo].[Tasks].[Id]
      WHERE
          [dbo].[UserTask].[User_Id] = '${userId}' AND [dbo].[UserTask].[Accepted] = 1
    `);
    return result.recordset[0][''] || 0;
  }
}

const taskRepository = new TaskRepository();
export default taskRepository;
