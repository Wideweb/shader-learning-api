import userActivityRepository from '@/dataAccess/user-activity.repository';
import { UserAchievementChecker, UserAchievementCheckerContext } from './user-achievement-checker';
import { UserActivityType } from '../user-activity-type';

export class FirstStepAchievementChecker implements UserAchievementChecker {
  private _triggers = [UserActivityType.TaskSubmitAccepted];

  public get achievementId() {
    return 1;
  }

  public get triggers(): UserActivityType[] {
    return this._triggers;
  }

  public async getProgress(context: UserAchievementCheckerContext): Promise<number> {
    const activities = await userActivityRepository.getFirstFilteredByTypes(context.userId, [UserActivityType.TaskSubmitAccepted]);
    return activities.length > 0 ? 1 : 0;
  }

  public async reached(context: UserAchievementCheckerContext): Promise<boolean> {
    const progress = await this.getProgress(context);
    return progress >= 0;
  }
}
