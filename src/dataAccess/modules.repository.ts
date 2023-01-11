import { logger } from '@/utils/logger';
import dbConnection from './db-connection';
import { ModuleListModel, ModuleModel } from './models/module.model';

export class ModuleRepository {
  public async findById(id: number): Promise<ModuleModel> {
    const result = await dbConnection.query<ModuleModel>(`SELECT * FROM Modules WHERE Id = :id LIMIT 1`, { id });
    return result[0];
  }

  public async findByName(name: string): Promise<ModuleModel> {
    const result = await dbConnection.query<ModuleModel>(`SELECT * FROM Modules WHERE Name = :name LIMIT 1`, { name });
    return result[0];
  }

  public async getLastModuleOrder(): Promise<number> {
    const result = await dbConnection.query<number>(`SELECT Modules.Order as \`Order\` FROM Modules ORDER BY Modules.Order DESC LIMIT 1`);
    const order = Number.parseInt(result[0] ? result[0]['Order'] : -1);
    return Number.isNaN(order) ? -1 : order;
  }

  public async createModule(module: ModuleModel): Promise<number> {
    try {
      const result = await dbConnection.query(
        `
        INSERT INTO Modules (Name, Description, CreatedBy, Locked, \`Order\`)
        VALUES (:Name, :Description, :CreatedBy, :Locked, :Order);
      `,
        { ...module },
      );
      return result.insertId;
    } catch (err) {
      logger.error(
        `DB: Failed to create module | Name:${module.Name}, Description:${module.Description}, CreatedBy:${module.CreatedBy}, Locked:${module.Locked}, Order:${module.Order}, error:${err.message}`,
      );
      return -1;
    }
  }

  public async updateModule(module: ModuleModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE Modules
        SET 
          Name = :Name, Description = :Description, Locked = :Locked, \`Order\` = :Order
        WHERE 
          Id = ${module.Id};
      `,
        { ...module, Locked: module.Locked ? 1 : 0 },
      );
      return true;
    } catch (err) {
      logger.error(
        `DB: Failed to update module | Name:${module.Name}, Description:${module.Description}, CreatedBy:${module.CreatedBy},  Locked:${module.Locked}, Order:${module.Order} error:${err.message}`,
      );
      return false;
    }
  }

  public async getModuleList(userId: number): Promise<ModuleListModel[]> {
    const result = await dbConnection.query<ModuleListModel>(
      `
      SELECT
        Modules.Id,
        Modules.Name,
        Modules.Description,
        Modules.Locked,
        Modules.Order,
        IFNULL(Module_Tasks.Size, 0) AS \`Tasks\`,
        IFNULL(User_Tasks.Size, 0) AS \`AcceptedTasks\`
      FROM Modules
      LEFT JOIN 
          (
              SELECT Tasks.Module_Id, Count(Tasks.Id) as Size
              FROM Tasks
              WHERE Tasks.Visibility = 1
              GROUP BY Tasks.Module_Id
          ) Module_Tasks ON Modules.Id = Module_Tasks.Module_Id

      LEFT JOIN 
          (
              SELECT Tasks.Module_Id, Count(UserTask.User_Id) as Size
              FROM UserTask
              INNER JOIN Tasks ON UserTask.Task_Id = Tasks.Id
              WHERE UserTask.User_Id = :userId AND Tasks.Visibility = 1 AND UserTask.Accepted = 1
              GROUP BY Tasks.Module_Id
          ) User_Tasks ON Modules.Id = User_Tasks.Module_Id

      ORDER BY Modules.Order
      LIMIT 100
    `,
      { userId },
    );
    return result;
  }

  public async rerderTasks(moduleId: number, oldOrder: number, newOrder: number): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE Tasks
        SET Order = 
          CASE Order WHEN :oldOrder THEN :newOrder
          ELSE Order + SIGN(:oldOrder - :newOrder) END
        WHERE Module_Id = :moduleId AND Order BETWEEN LEAST(:oldOrder, :newOrder) AND GREATEST(:oldOrder, :newOrder);
      `,
        { oldOrder, newOrder, moduleId },
      );
      return true;
    } catch {
      return false;
    }
  }
}

const moduleRepository = new ModuleRepository();
export default moduleRepository;
