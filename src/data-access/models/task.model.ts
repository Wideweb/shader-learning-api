export interface TaskModel {
  Id: number;
  Name: string;
  Threshold: number;
  Order: number;
  Cost: number;
}

export interface UserTaskModel {
  User_Id: number;
  Task_Id: number;
  Score: number;
  Accepted: 0 | 1;
  Rejected: 0 | 1;
}
