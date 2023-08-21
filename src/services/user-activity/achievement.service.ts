import achievemenstRepository from '@/dataAccess/achievements.repository';
import { UserAchievementCompletedDto } from '@/dtos/achivment.dto';

class AchievementService {
  public async getUserAchievementsUnviewed(userId: number): Promise<UserAchievementCompletedDto[]> {
    const achievements = await achievemenstRepository.getUserAchievementsUnviewedForView(userId);
    return achievements.map(it => ({
      achievementId: it.Achievement_Id,
      name: it.Name,
      message: it.Message,
      at: it.At,
    }));
  }

  public async getUserAchievements(userId: number): Promise<UserAchievementCompletedDto[]> {
    const achievements = await achievemenstRepository.getUserAchievementsForView(userId);
    return achievements.map(it => ({
      achievementId: it.Achievement_Id,
      name: it.Name,
      message: it.Message,
      at: it.At,
    }));
  }

  public async viewUserAchievement(userId: number, achievementId: number): Promise<boolean> {
    return await achievemenstRepository.setUserAchievementAsViewed(userId, achievementId);
  }
}

const achievementService = new AchievementService();
export default achievementService;
