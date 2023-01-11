import { logger } from '@/utils/logger';
import dbConnection from './db-connection';
import { TaskListModel, TaskModel, UserTaskModel, UserTaskResultModel } from './models/task.model';

export class TaskRepository {
  public async findById(id: number): Promise<TaskModel> {
    const result = await dbConnection.query<TaskModel>(`SELECT * FROM Tasks WHERE Id = :id LIMIT 1`, { id });
    return result[0];
  }

  public async findByName(name: string): Promise<TaskModel> {
    const result = await dbConnection.query<TaskModel>(`SELECT * FROM Tasks WHERE Name = :name LIMIT 1`, { name });
    return result[0];
  }

  public async getLastTaskOrder(moduleId: number): Promise<number> {
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
  }

  public async createTask(task: TaskModel): Promise<number> {
    try {
      const result = await dbConnection.query(
        `
          INSERT INTO Tasks (Name, Threshold, \`Order\`, Cost, Visibility, Module_Id, CreatedBy)
          VALUES (:Name, :Threshold, :Order, :Cost, :Visibility, :Module_Id, :CreatedBy);
      `,
        { ...task },
      );
      return result.insertId;
    } catch (err) {
      logger.error(
        `DB: Failed to create task | Name:${task.Name}, Threshold:${task.Threshold}, Order:${task.Order}, Cost:${task.Cost}, error:${err.message}`,
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
          Name = :Name, Threshold = :Threshold, \`Order\` = :Order, Cost = :Cost, Visibility = :Visibility
        WHERE 
          Id = ${task.Id};
      `,
        { ...task },
      );
      return true;
    } catch (err) {
      logger.error(
        `DB: Failed to update task | Name:${task.Name}, Threshold:${task.Threshold}, Order:${task.Order}, Cost:${task.Cost}, error:${err.message}`,
      );
      return false;
    }
  }

  public async getLikes(taskId: number): Promise<number> {
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
  }

  public async getDislikes(taskId: number): Promise<number> {
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
  }

  public async getModuleTaskList(moduleId: number): Promise<TaskListModel[]> {
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
  }

  public async getTaskList(): Promise<TaskListModel[]> {
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
  }

  public async createUserTask(task: UserTaskModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
          INSERT INTO UserTask (User_Id, Task_Id, Score, Accepted, Rejected)
          VALUES (:User_Id, :Task_Id, :Score, :Accepted, :Rejected);
      `,
        { ...task },
      );
      return true;
    } catch {
      return false;
    }
  }

  public async updateUserTask(task: UserTaskModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
          UPDATE UserTask
          SET 
            Score = :Score, Accepted = :Accepted, Rejected = :Rejected
          WHERE 
            User_Id = :User_Id AND Task_Id = :Task_Id;
      `,
        { ...task },
      );
      return true;
    } catch {
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
    } catch {
      return false;
    }
  }

  public async findUserTask(userId: number, taskId: number): Promise<UserTaskModel> {
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
    return result[0];
  }

  public async getUserTaskResults(userId: number): Promise<UserTaskResultModel[]> {
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
          UserTask.User_Id = :userId
      ORDER BY Tasks.Order
    `,
      { userId },
    );
    return result;
  }

  public async getUserModuleTaskResults(userId: number, moduleId: number): Promise<UserTaskResultModel[]> {
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
  }

  public async findNext(userId: number): Promise<TaskModel> {
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
  }

  public async getUserScore(userId: number): Promise<number> {
    const result = await dbConnection.query<number>(
      `
      SELECT SUM(UserTask.Score) as \`UserScore\`
      FROM
          UserTask
      INNER JOIN Tasks ON UserTask.Task_Id = Tasks.Id
      WHERE
          UserTask.User_Id = :userId AND UserTask.Accepted = 1
    `,
      { userId },
    );
    return result[0]['UserScore'] || 0;
  }
}

const taskRepository = new TaskRepository();
export default taskRepository;
