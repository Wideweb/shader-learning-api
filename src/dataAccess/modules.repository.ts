import { logger } from '@/utils/logger';
import { query } from 'mssql';
import { ModuleListModel, ModuleModel } from './models/module.model';

export class ModuleRepository {
  public async findById(id: number): Promise<ModuleModel> {
    const result = await query<ModuleModel>(`SELECT TOP (1) * FROM [dbo].[Modules] WHERE [Id] = ${id}`);
    return result.recordset[0];
  }

  public async findByName(name: string): Promise<ModuleModel> {
    const result = await query<ModuleModel>(`SELECT TOP (1) * FROM [dbo].[Modules] WHERE [Name] = '${name}'`);
    return result.recordset[0];
  }

  public async getLastModuleOrder(): Promise<number> {
    const result = await query<number>(`SELECT TOP 1 ([Order]) FROM [dbo].[Modules] ORDER BY [Order] DESC`);
    return result.recordset[0][''] || -1;
  }

  public async createModule(module: ModuleModel): Promise<number> {
    try {
      const result = await query(`
        INSERT INTO [dbo].[Modules] ([Name], [Description], [CreatedBy], [Locked], [Order])
        VALUES ('${module.Name}', '${module.Description}', ${module.CreatedBy}, ${module.Locked}, ${module.Order});
        SELECT SCOPE_IDENTITY();
      `);
      return result.recordset[0][''];
    } catch (err) {
      logger.error(
        `DB: Failed to create module | Name:${module.Name}, Description:${module.Description}, CreatedBy:${module.CreatedBy}, Locked:${module.Locked}, Order:${module.Order}, error:${err.message}`,
      );
      return -1;
    }
  }

  public async updateModule(module: ModuleModel): Promise<boolean> {
    try {
      await query(`
        UPDATE [dbo].[Modules]
        SET 
          [Name] = '${module.Name}', [Description] = '${module.Description}', [Locked] = ${module.Locked}, [Order] = ${module.Order}
        WHERE 
          [Id] = ${module.Id};
      `);
      return true;
    } catch (err) {
      logger.error(
        `DB: Failed to update module | Name:${module.Name}, Description:${module.Description}, CreatedBy:${module.CreatedBy},  Locked:${module.Locked}, Order:${module.Order} error:${err.message}`,
      );
      return false;
    }
  }

  public async getModuleList(userId: number): Promise<ModuleListModel[]> {
    const result = await query<ModuleListModel>(`
      SELECT TOP(100)
        [dbo].[Modules].[Id],
        [dbo].[Modules].[Name],
        [dbo].[Modules].[Description],
        [dbo].[Modules].[Locked],
        [dbo].[Modules].[Order],
        ISNULL([Module_Tasks].[Size], 0) AS [Tasks],
        ISNULL([User_Tasks].[Size], 0) AS [AcceptedTasks]
      FROM [dbo].[Modules]
      LEFT JOIN 
          (
              SELECT [dbo].[Tasks].[Module_Id], Count([dbo].[Tasks].[Id]) as [Size]
              FROM [dbo].[Tasks]
              GROUP BY [dbo].[Tasks].[Module_Id]
          ) [Module_Tasks] ON [dbo].[Modules].[Id] = [Module_Tasks].[Module_Id]

      LEFT JOIN 
          (
              SELECT [dbo].[Tasks].[Module_Id], Count([dbo].[UserTask].[User_Id]) as [Size]
              FROM [dbo].[UserTask]
              INNER JOIN [dbo].[Tasks] ON [dbo].[UserTask].[Task_Id] = [dbo].[Tasks].[Id]
              WHERE [dbo].[UserTask].[User_Id] = ${userId} AND [dbo].[Tasks].[Visibility] = 1 AND [dbo].[UserTask].[Accepted] = 1
              GROUP BY [dbo].[Tasks].[Module_Id]
          ) [User_Tasks] ON [dbo].[Modules].[Id] = [User_Tasks].[Module_Id]

      ORDER BY [dbo].[Modules].[Order]
    `);
    return result.recordset;
  }

  public async rerderTasks(moduleId: number, oldOrder: number, newOrder: number): Promise<boolean> {
    try {
      await query(`
        UPDATE [dbo].[Tasks]
        SET [Order] = 
          CASE [Order] WHEN ${oldOrder} THEN ${newOrder}
          ELSE [Order] + SIGN(${oldOrder} - ${newOrder}) END
        WHERE [Module_Id] = ${moduleId} AND [Order] BETWEEN LEAST(${oldOrder}, ${newOrder}) AND GREATEST(${oldOrder}, ${newOrder});
      `);
      return true;
    } catch {
      return false;
    }
  }
}

const moduleRepository = new ModuleRepository();
export default moduleRepository;
