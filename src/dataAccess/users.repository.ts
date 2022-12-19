import { query } from 'mssql';
import { UserModel } from '@dataAccess/models/user.model';

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
}

const userRepository = new UserRepository();
export default userRepository;
