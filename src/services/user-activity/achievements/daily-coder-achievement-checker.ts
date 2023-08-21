import userActivityRepository from '@/dataAccess/user-activity.repository';
import { UserAchievementChecker, UserAchievementCheckerContext } from './user-achievement-checker';
import { UserActivityType } from '../user-activity-type';

const DAY_MILLIS = 24 * 60 * 60 * 1000;

export class DailyCoderAchievementChecker implements UserAchievementChecker {
  private _triggers = [UserActivityType.TaskSubmitAccepted];

  private _requiredDays = 7;

  public get achievementId() {
    return 2;
  }

  public get triggers(): UserActivityType[] {
    return this._triggers;
  }

  public async getProgress(context: UserAchievementCheckerContext): Promise<number> {
    const from = this.dateTimeToDate(new Date(), -6);
    const to = this.dateTimeToDate(new Date(), 1);

    const activity = await userActivityRepository.getInIntervalFilteredByTypes(context.userId, from, to, this.triggers);
    const activityDates = activity.map(it => this.dateTimeToDate(it.At, 0));

    let progress = 0;
    for (let i = activityDates.length - 1; i > 0; i--) {
      const date = activityDates[i];
      const prevDate = activityDates[i - 1];

      const delta = date.getTime() - prevDate.getTime();

      if (delta == DAY_MILLIS) {
        progress++;
      }

      if (delta > DAY_MILLIS) {
        break;
      }

      if (progress >= this._requiredDays) {
        return this._requiredDays;
      }
    }

    return progress;
  }

  public async reached(context: UserAchievementCheckerContext): Promise<boolean> {
    const progress = await this.getProgress(context);
    return progress >= this._requiredDays;
  }

  private dateTimeToDate(dateTime: Date, daysOffset: number) {
    let time = dateTime.getTime();
    time = time - (time % 86400000);
    time = time + daysOffset * DAY_MILLIS;
    return new Date(time);
  }
}
