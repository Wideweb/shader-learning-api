export interface TaskModel {
  Id: number;
  Module_Id: number;
  Name: string;
  Threshold: number;
  Order: number;
  Cost: number;
  Visibility: 0 | 1;
  CreatedBy: number;
  Channel_1: 0 | 1;
  Channel_2: 0 | 1;
  Animated: 0 | 1;
  AnimationSteps: number;
  AnimationStepTime: number;
}

export interface TaskListModel {
  Id: number;
  Name: string;
  Order: number;
  Threshold: number;
  Cost: number;
  Visibility: 0 | 1;
  Module_Id: number;
}

export interface UserTaskModel {
  User_Id: number;
  Task_Id: number;
  Score: number;
  Accepted: 0 | 1;
  Rejected: 0 | 1;
  Liked?: boolean | null;
}

export interface UserTaskResultModel {
  Id: number;
  Module_Id: number;
  Name: string;
  Order: number;
  Cost: number;
  Score: number;
  Accepted: 0 | 1;
  Rejected: 0 | 1;
}
