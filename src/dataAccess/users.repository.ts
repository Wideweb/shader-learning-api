import { Utils } from '@/services/utils';
import { logger } from '@/utils/logger';
import { UserModel, UserProfileModel, UserRankedListModel, UserSessionModel } from '@dataAccess/models/user.model';
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

  public async createUserSession(userId: number, refreshToken: string): Promise<number> {
    try {
      const result = await dbConnection.query(
        `
        INSERT INTO UserSessions (User_id, RefreshToken, StartedAt)
        VALUES (:userId, :refreshToken, :startedAt);
      `,
        { userId, refreshToken, startedAt: Utils.getUTC() },
      );
      return result.insertId;
    } catch (err) {
      logger.error(`DB: Failed to create session | userId:${userId}, refreshToken:${refreshToken}`);
      return -1;
    }
  }

  public async findUserSession(sessionId: number): Promise<UserSessionModel> {
    const result = await dbConnection.query<UserModel>(`SELECT * FROM UserSessions WHERE Id = :sessionId LIMIT 1`, { sessionId });
    return result[0];
  }

  public async setRefreshToken(sessionId: number, token: string): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE UserSessions
        SET 
          RefreshToken = :token
        WHERE 
          Id = :sessionId
      `,
        { sessionId, token },
      );
      return true;
    } catch {
      return false;
    }
  }

  public async finishUserSession(sessionId: number): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE UserSessions
        SET 
          RefreshToken = :token, RefreshToken = :refreshToken, FinishedAt = :finishedAt
        WHERE 
          Id = :sessionId
      `,
        { sessionId, refreshToken: null, finishedAt: Utils.getUTC() },
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
