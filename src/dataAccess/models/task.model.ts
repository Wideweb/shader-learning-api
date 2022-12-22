export interface TaskModel {
  Id: number;
  Name: string;
  Threshold: number;
  Order: number;
  Cost: number;
  Visibility: 0 | 1;
}

export interface TaskListModel {
  Id: number;
  Name: string;
  Order: number;
  Threshold: number;
  Cost: number;
  Visibility: 0 | 1;
}

export interface UserTaskModel {
  User_Id: number;
  Task_Id: number;
  Score: number;
  Accepted: 0 | 1;
  Rejected: 0 | 1;
}

export interface UserTaskResultModel {
  Id: number;
  Name: string;
  Order: number;
  Score: number;
  Accepted: 0 | 1;
  Rejected: 0 | 1;
}
