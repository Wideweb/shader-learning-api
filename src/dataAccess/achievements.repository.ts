import { logger } from '@/utils/logger';
import dbConnection from './db-connection';
import { AchievementModel, UserAchievementModel, UserAchievementViewModel } from './models/achievement.model';

export class AchievemenstRepository {
  public async saveUserAchievement(userAchievement: UserAchievementModel): Promise<boolean> {
    try {
      await dbConnection.query(
        `
          INSERT INTO UserAchievements (Achievement_Id, User_Id, At)
          VALUES (:Achievement_Id, :User_Id, :At);
        `,
        { ...userAchievement },
      );
      return true;
    } catch (err) {
      logger.error(
        `AchievemenstRepository::saveUserAchievement |
          userId:${userAchievement.User_Id};
          achievementId:${userAchievement.Achievement_Id};
          at:${userAchievement.At}.`,
      );
      return false;
    }
  }

  public async setUserAchievementAsViewed(userId: number, achievementId: number): Promise<boolean> {
    try {
      await dbConnection.query(
        `
          UPDATE UserAchievements
          SET 
            Viewed = 1
          WHERE 
            User_Id = :userId AND Achievement_Id = :achievementId;
        `,
        { userId, achievementId },
      );
      return true;
    } catch (err) {
      logger.error(
        `AchievemenstRepository::setUserAchievementAsViewed |
          userId:${userId};
          achievementId:${achievementId}.`,
      );
      return false;
    }
  }

  public async getUserAchievements(userId: number): Promise<UserAchievementModel[]> {
    try {
      const result = await dbConnection.query<UserAchievementModel>(
        `
          SELECT
            UserAchievements.Achievement_Id,
            UserAchievements.User_Id,
            UserAchievements.At
          FROM UserAchievements
          WHERE UserAchievements.User_Id = :userId
          ORDER BY UserAchievements.At
          LIMIT 1000
        `,
        { userId },
      );
      return result;
    } catch (err) {
      logger.error(`AchievemenstRepository::getUserAchievements | userId:${userId}; error: ${err.message}`);
      return null;
    }
  }

  public async getUserAchievementsUnviewedForView(userId: number): Promise<UserAchievementViewModel[]> {
    try {
      const result = await dbConnection.query<UserAchievementViewModel>(
        `
          SELECT
            Achievements.Id as Achievement_Id,
            Achievements.Name,
            Achievements.Message,
            UserAchievements.At
          FROM UserAchievements
          LEFT JOIN Achievements ON Achievements.Id = UserAchievements.Achievement_Id
          WHERE UserAchievements.User_Id = :userId AND UserAchievements.Viewed != 1
          ORDER BY UserAchievements.At
          LIMIT 1000
        `,
        { userId },
      );
      return result;
    } catch (err) {
      logger.error(`AchievemenstRepository::getUserAchievementsUnviewed | userId:${userId}; error: ${err.message}`);
      return null;
    }
  }

  public async getUserAchievementsForView(userId: number): Promise<UserAchievementViewModel[]> {
    try {
      const result = await dbConnection.query<UserAchievementViewModel>(
        `
          SELECT
            Achievements.Id,
            Achievements.Name,
            Achievements.Message,
            UserAchievements.At
          FROM UserAchievements
          LEFT JOIN Achievements ON Achievements.Id = UserAchievements.Achievement_Id
          WHERE UserAchievements.User_Id = :userId
          ORDER BY UserAchievements.At
          LIMIT 1000
        `,
        { userId },
      );
      return result;
    } catch (err) {
      logger.error(`AchievemenstRepository::getUserAchievementsViewed | userId:${userId}; error: ${err.message}`);
      return null;
    }
  }

  public async getAchievement(achievementId: number): Promise<AchievementModel> {
    try {
      const result = await dbConnection.query<UserAchievementModel>(
        `
          SELECT
            Achievements.Id,
            Achievements.Name,
            Achievements.Message
          FROM Achievements
          WHERE Achievements.Id = :achievementId
        `,
        { achievementId },
      );
      return result;
    } catch (err) {
      logger.error(`AchievemenstRepository::getAchievement | achievementId:${achievementId}; error: ${err.message}`);
      return null;
    }
  }
}

const achievemenstRepository = new AchievemenstRepository();
export default achievemenstRepository;
