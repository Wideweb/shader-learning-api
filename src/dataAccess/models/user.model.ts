export interface UserModel {
  Id: number;
  UserName: string;
  Email: string;
  Password: string;
  PasswordSalt: string;
  FailedLoginAttemptsCount: number;
  Role_Id: number;
}

export interface UserSessionModel {
  Id: number;
  User_Id: number;
  RefreshToken: string;
  StartedAt: Date;
  FinishedAt: Date;
}

export interface UserRankedListModel {
  Id: number;
  UserName: string;
  Rank: number;
  Solved: number;
}

export interface UserProfileModel {
  Id: number;
  UserName: string;
  Rank: number;
  Solved: number;
}
