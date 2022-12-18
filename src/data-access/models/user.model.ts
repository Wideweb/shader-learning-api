export interface UserModel {
  Id: number;
  UserName: string;
  Email: string;
  Password: string;
  PasswordSalt: string;
  FailedLoginAttemptsCount: number;
  Role_Id: number;
}
