import { Utils } from '@/services/utils';
import { logger } from '@/utils/logger';
import { UserModel, UserProfileModel, UserRankedListModel, UserSessionModel } from '@dataAccess/models/user.model';
import dbConnection from './db-connection';

export class UserRepository {
  public async findUserById(userId: number): Promise<UserModel> {
    try {
      const result = await dbConnection.query<UserModel>(`SELECT * FROM Users WHERE Id = :userId LIMIT 1`, { userId });
      return result[0];
    } catch (err) {
      logger.error(`UserRepository::findUserById | userId:${userId}; error:${err.message}`);
      return null;
    }
  }

  public async findUserByEmail(email: string): Promise<UserModel> {
    try {
      const result = await dbConnection.query<UserModel>(`SELECT * FROM Users WHERE Email = :email LIMIT 1`, { email });
      return result[0];
    } catch (err) {
      logger.error(`UserRepository::findUserByEmail | email:${email}; error:${err.message}`);
      return null;
    }
  }

  public async findUserByName(userName: string): Promise<UserModel> {
    try {
      const result = await dbConnection.query<UserModel>(`SELECT * FROM Users WHERE UserName = :userName LIMIT 1`, { userName });
      return result[0];
    } catch (err) {
      logger.error(`UserRepository::findUserByName | userName:${userName}; error:${err.message}`);
      return null;
    }
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
    } catch (err) {
      logger.error(
        `UserRepository::createUser |
        name:${user.UserName}
        email:${user.Email};
        role:${user.Role_Id};
        failedLoginAttemptsCount:${user.FailedLoginAttemptsCount};
        password:${user.Password ? '[HIDDEN]' : ''};
        passwordSalt:${user.PasswordSalt ? '[HIDDEN]' : ''};
        error:${err.message}`,
      );
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
      logger.error(`UserRepository::createUserSession | userId:${userId}; refreshToken:${refreshToken}; error:${err.message}`);
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
    } catch (err) {
      logger.error(`UserRepository::setRefreshToken | sessionId:${sessionId}; token:${token}; error:${err.message}`);
      return false;
    }
  }

  public async finishUserSession(sessionId: number): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE UserSessions
        SET 
          RefreshToken = :refreshToken, FinishedAt = :finishedAt
        WHERE 
          Id = :sessionId
      `,
        { sessionId, refreshToken: null, finishedAt: Utils.getUTC() },
      );
      return true;
    } catch (err) {
      logger.error(`UserRepository::finishUserSession | sessionId:${sessionId}; error:${err.message}`);
      return false;
    }
  }

  public async invalidateUserSessions(userId: number): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE UserSessions
        SET 
          RefreshToken = :refreshToken, FinishedAt = :finishedAt
        WHERE 
          User_Id = :userId AND FinishedAt IS NULL
      `,
        { userId, refreshToken: null, finishedAt: Utils.getUTC() },
      );
      return true;
    } catch (err) {
      logger.error(`UserRepository::invalidateUserSessions | userId:${userId}; error:${err.message}`);
      return false;
    }
  }

  public async setResetPasswordToken(userId: number, token: string): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE Users
        SET 
          ResetPasswordToken = :token
        WHERE 
          Id = :userId
      `,
        { userId, token },
      );
      return true;
    } catch (err) {
      logger.error(`UserRepository::setResetPasswordToken | userId:${userId}; token:${token}; error:${err.message}`);
      return false;
    }
  }

  public async setPassword(userId: number, password: string, passwordSalt: string): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        UPDATE Users
        SET 
          Password = :password,
          PasswordSalt = :passwordSalt,
          ResetPasswordToken = NULL
        WHERE 
          Id = :userId
      `,
        { userId, password, passwordSalt },
      );
      return true;
    } catch (err) {
      logger.error(
        `UserRepository::createUser |
        userId:${userId};
        password:${password ? '[HIDDEN]' : ''};
        passwordSalt:${passwordSalt ? '[HIDDEN]' : ''};
        error:${err.message}`,
      );
      return false;
    }
  }

  public async getRankedList(): Promise<UserRankedListModel[]> {
    try {
      const result = await dbConnection.query<UserRankedListModel>(`
        SELECT
          Users.Id,
          Users.UserName,
          SUM(IFNULL(UserTask.Score, 0)) AS \`Rank\`,
          COUNT(UserTask.Task_Id) AS Solved
        FROM 
          Users
        LEFT JOIN UserTask ON Users.Id = UserTask.User_Id AND UserTask.Accepted = 1
        LEFT JOIN Tasks ON UserTask.Task_Id = Tasks.Id
        WHERE Tasks.Id IS NULL OR Tasks.Visibility = 1
        GROUP BY Users.Id, Users.UserName
        ORDER BY \`Rank\` DESC
        LIMIT 1000
      `);
      return result;
    } catch (err) {
      logger.error(`UserRepository::getRankedList | error:${err.message}`);
      return [];
    }
  }

  public async findProfile(userId: number): Promise<UserProfileModel> {
    try {
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
      LEFT JOIN Tasks ON UserTask.Task_Id = Tasks.Id
      WHERE Users.Id = :userId AND (Tasks.Id IS NULL OR Tasks.Visibility = 1)
      GROUP BY Users.Id, Users.UserName
      ORDER BY \`Rank\` DESC
      LIMIT 1
    `,
        { userId },
      );
      return result[0];
    } catch (err) {
      logger.error(`UserRepository::findProfile | error:${err.message}`);
      return null;
    }
  }
}

const userRepository = new UserRepository();
export default userRepository;
