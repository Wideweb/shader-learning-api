import { UserActivityType } from '../user-activity-type';

export interface UserAchievementCheckerContext {
  userId: number;
}

export interface UserAchievementChecker {
  get achievementId(): number;
  get triggers(): UserActivityType[];
  getProgress(context: UserAchievementCheckerContext): Promise<number>;
  reached(context: UserAchievementCheckerContext): Promise<boolean>;
}
