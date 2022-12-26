export interface UserModel {
  Id: number;
  UserName: string;
  Email: string;
  Password: string;
  PasswordSalt: string;
  FailedLoginAttemptsCount: number;
  Role_Id: number;
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
