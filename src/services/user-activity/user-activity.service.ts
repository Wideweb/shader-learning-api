import userHistoryRepository from '@/dataAccess/user-activity.repository';
import { Utils } from '../utils';
import achievemenstRepository from '@/dataAccess/achievements.repository';
import { UserAchievementChecker, UserAchievementCheckerContext } from './achievements/user-achievement-checker';
import { DailyCoderAchievementChecker } from './achievements/daily-coder-achievement-checker';
import { UserActivityType } from './user-activity-type';
import { FirstStepAchievementChecker } from './achievements/first-step-achievement-checker';
import { UserAchievementCompletedDto } from '@/dtos/achivment.dto';

class UserActivityService {
  private checkersList = [];

  private chackersMap: { [key: number]: UserAchievementChecker[] } = {};

  public initialize(): void {
    this.checkersList = [new FirstStepAchievementChecker(), new DailyCoderAchievementChecker()];

    for (const checker of this.checkersList) {
      for (const actionType of checker.triggers) {
        if (!this.chackersMap[actionType]) {
          this.chackersMap[actionType] = [];
        }
        this.chackersMap[actionType].push(checker);
      }
    }
  }

  public async addUserAction(userId: number, activityType: UserActivityType): Promise<UserAchievementCompletedDto[]> {
    userHistoryRepository.save({
      Id: null,
      User_Id: userId,
      Type: activityType,
      At: Utils.getUTC(),
    });

    const userAchievements = await achievemenstRepository.getUserAchievements(userId);

    const context: UserAchievementCheckerContext = { userId };

    const achievementsChecks = (this.chackersMap[activityType] || [])
      .filter(checker => !userAchievements.some(userAchievement => userAchievement.Achievement_Id == checker.achievementId))
      .filter(checker => checker.triggers.includes(activityType))
      .map(async checker => ((await checker.reached(context)) ? checker.achievementId : -1));

    const newAchievementIds = (await Promise.all(achievementsChecks)).filter(it => it > 0);

    if (newAchievementIds.length <= 0) {
      return [];
    }

    const saveRequests = newAchievementIds.map(achievementId =>
      achievemenstRepository.saveUserAchievement({
        Achievement_Id: achievementId,
        User_Id: userId,
        At: Utils.getUTC(),
        Viewed: 0,
      }),
    );
    await Promise.all(saveRequests);

    const achievementsModels = await Promise.all(newAchievementIds.map(id => achievemenstRepository.getAchievement(id)));
    return achievementsModels.map(
      model =>
        ({
          achievementId: model.Id,
          name: model.Name,
          message: model.Message,
          at: Utils.getUTC(),
        } as UserAchievementCompletedDto),
    );
  }
}

const userActivityService = new UserActivityService();
export default userActivityService;
