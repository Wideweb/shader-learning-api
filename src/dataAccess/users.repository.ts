import { query } from 'mssql';
import { UserModel, UserProfileModel, UserRankedListModel } from '@dataAccess/models/user.model';

export class UserRepository {
  public async findUserById(userId: number): Promise<UserModel> {
    const result = await query<UserModel>(`SELECT TOP (1) * FROM [dbo].[Users] WHERE [Id] = ${userId}`);
    return result.recordset[0];
  }

  public async findUserByEmail(email: string): Promise<UserModel> {
    const result = await query<UserModel>(`SELECT TOP (1) * FROM [dbo].[Users] WHERE [Email] = '${email}'`);
    return result.recordset[0];
  }

  public async findUserByName(userName: string): Promise<UserModel> {
    const result = await query<UserModel>(`SELECT TOP (1) * FROM [dbo].[Users] WHERE [UserName] = '${userName}'`);
    return result.recordset[0];
  }

  public async createUser(user: UserModel): Promise<boolean> {
    try {
      await query(`
          INSERT INTO [dbo].[Users] ([UserName], [Email], [PasswordSalt], [Password], [FailedLoginAttemptsCount], [Role_Id])
          VALUES ('${user.UserName}', '${user.Email}', '${user.PasswordSalt}', '${user.Password}', ${user.FailedLoginAttemptsCount}, ${user.Role_Id});
      `);
      return true;
    } catch {
      return false;
    }
  }

  public async setRefreshToken(userId: number, token: string): Promise<boolean> {
    try {
      await query(`
          UPDATE [dbo].[Users]
          SET 
            [RefreshToken] = '${token}'
          WHERE 
            [Id] = ${userId}
      `);
      return true;
    } catch {
      return false;
    }
  }

  public async getRankedList(): Promise<UserRankedListModel[]> {
    const result = await query<UserRankedListModel>(`
      SELECT TOP (1000) 
        [dbo].[Users].[Id],
        [dbo].[Users].[UserName],
        SUM(ISNULL([dbo].[UserTask].[Score], 0)) AS Rank,
        COUNT([dbo].[UserTask].[Task_Id]) AS Solved
      FROM 
        [dbo].[Users]
      LEFT JOIN [dbo].[UserTask] ON [dbo].[Users].[Id] = [dbo].[UserTask].[User_Id] AND [dbo].[UserTask].[Accepted] = 1
      GROUP BY [dbo].[Users].[Id], [dbo].[Users].[UserName]
      ORDER BY Rank DESC
    `);
    return result.recordset;
  }

  public async findProfile(userId: number): Promise<UserProfileModel> {
    const result = await query<UserProfileModel>(`
      SELECT
        [dbo].[Users].[Id],
        [dbo].[Users].[UserName],
        SUM(ISNULL([dbo].[UserTask].[Score], 0)) AS Rank,
        COUNT([dbo].[UserTask].[Task_Id]) AS Solved
      FROM 
        [dbo].[Users]
      LEFT JOIN [dbo].[UserTask] ON [dbo].[Users].[Id] = [dbo].[UserTask].[User_Id]  AND [dbo].[UserTask].[Accepted] = 1
      WHERE [dbo].[Users].[Id] = ${userId}
      GROUP BY [dbo].[Users].[Id], [dbo].[Users].[UserName]
      ORDER BY Rank DESC
    `);
    return result.recordset[0];
  }
}

const userRepository = new UserRepository();
export default userRepository;
