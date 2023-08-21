export interface AchievementModel {
  Id: number | null;
  Name: string;
  Message: string;
}

export interface UserAchievementModel {
  Achievement_Id: number;
  User_Id: number;
  At: Date;
  Viewed: 1 | 0;
}

export interface UserAchievementViewModel {
  Achievement_Id: number;
  Name: string;
  Message: string;
  At: Date;
}
