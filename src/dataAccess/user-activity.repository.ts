import { logger } from '@/utils/logger';
import dbConnection from './db-connection';
import { UserActivityModel } from './models/user-activity.model';
import { UserActivityType } from '@/services/user-activity/user-activity-type';

export class UserActivityRepository {
  public async save(item: UserActivityModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
        INSERT INTO UserActivity (User_Id, Type, At)
        VALUES (:User_Id, :Type, :At);
      `,
        { ...item },
      );
      return true;
    } catch (err) {
      logger.error(
        `UserActivityRepository::save |
          userId:${item.User_Id};
          type:${item.Type};
          at:${item.At}.`,
      );
      return false;
    }
  }

  public async getFirstFilteredByTypes(userId: number, types: UserActivityType[]): Promise<UserActivityModel[]> {
    try {
      const result = await dbConnection.query<UserActivityModel>(
        `
        SELECT *
        FROM UserActivity
        WHERE User_Id = :userId AND UserActivity.Type IN (${types.join(',')})
        ORDER BY UserActivity.At
        LIMIT 1
      `,
        { userId },
      );
      return result;
    } catch (err) {
      logger.error(`UserActivityRepository::getByTypes | userId:${userId}; types:[${types.join(',')}] error: ${err.message}`);
      return null;
    }
  }

  public async getInInterval(userId: number, from: Date, to: Date): Promise<UserActivityModel[]> {
    try {
      const result = await dbConnection.query<UserActivityModel>(
        `
        SELECT *
        FROM UserActivity
        WHERE User_Id = :userId AND UserActivity.At >= :from AND UserActivity.At <= :to
        ORDER BY UserActivity.At
        LIMIT 1000
      `,
        { userId, from, to },
      );
      return result;
    } catch (err) {
      logger.error(`UserActivityRepository::get | userId:${userId}; from:${from}; to:${to}; error: ${err.message}`);
      return null;
    }
  }

  public async getInIntervalFilteredByTypes(userId: number, from: Date, to: Date, types: UserActivityType[]): Promise<UserActivityModel[]> {
    try {
      const result = await dbConnection.query<UserActivityModel>(
        `
        SELECT *
        FROM UserActivity
        WHERE User_Id = :userId AND UserActivity.At >= :from AND UserActivity.At <= :to AND UserActivity.Type IN (${types.join(',')})
        ORDER BY UserActivity.At
        LIMIT 1000
      `,
        { userId, from, to },
      );
      return result;
    } catch (err) {
      logger.error(`UserActivityRepository::getByTypes | userId:${userId}; from:${from}; to:${to}; types:[${types.join(',')}] error: ${err.message}`);
      return null;
    }
  }
}

const userActivityRepository = new UserActivityRepository();
export default userActivityRepository;
