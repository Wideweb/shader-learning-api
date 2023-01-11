import { UserModel, UserProfileModel, UserRankedListModel } from '@dataAccess/models/user.model';
import dbConnection from './db-connection';

export class UserRepository {
  public async findUserById(userId: number): Promise<UserModel> {
    const result = await dbConnection.query<UserModel>(`SELECT * FROM Users WHERE Id = :userId LIMIT 1`, { userId });
    return result[0];
  }

  public async findUserByEmail(email: string): Promise<UserModel> {
    const result = await dbConnection.query<UserModel>(`SELECT * FROM Users WHERE Email = :email LIMIT 1`, { email });
    return result[0];
  }

  public async findUserByName(userName: string): Promise<UserModel> {
    const result = await dbConnection.query<UserModel>(`SELECT * FROM Users WHERE UserName = :userName LIMIT 1`, { userName });
    return result[0];
  }

  public async createUser(user: UserModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
          INSERT INTO Users (UserName, Email, PasswordSalt, Password, FailedLoginAttemptsCount, Role_Id)
          VALUES (:UserName, :Email, :PasswordSalt, :Password, :FailedLoginAttemptsCount, :Role_Id);
      `,
        { ...user },
      );
      return true;
    } catch {
      return false;
    }
  }

  public async setRefreshToken(userId: number, token: string): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE Users
        SET 
          RefreshToken = :token
        WHERE 
          Id = :userId
      `,
        { token, userId },
      );
      return true;
    } catch {
      return false;
    }
  }

  public async getRankedList(): Promise<UserRankedListModel[]> {
    const result = await dbConnection.query<UserRankedListModel>(`
      SELECT
        Users.Id,
        Users.UserName,
        SUM(IFNULL(UserTask.Score, 0)) AS \`Rank\`,
        COUNT(UserTask.Task_Id) AS Solved
      FROM 
        Users
      LEFT JOIN UserTask ON Users.Id = UserTask.User_Id AND UserTask.Accepted = 1
      GROUP BY Users.Id, Users.UserName
      ORDER BY \`Rank\` DESC
      LIMIT 1000
    `);
    return result;
  }

  public async findProfile(userId: number): Promise<UserProfileModel> {
    const result = await dbConnection.query<UserProfileModel>(
      `
      SELECT
        Users.Id,
        Users.UserName,
        SUM(IFNULL(UserTask.Score, 0)) AS \`Rank\`,
        COUNT(UserTask.Task_Id) AS Solved
      FROM 
      Users
        LEFT JOIN UserTask ON Users.Id = UserTask.User_Id AND UserTask.Accepted = 1
      WHERE Users.Id = :userId
      GROUP BY Users.Id, Users.UserName
      ORDER BY \`Rank\` DESC
      LIMIT 1
    `,
      { userId },
    );
    return result[0];
  }
}

const userRepository = new UserRepository();
export default userRepository;
