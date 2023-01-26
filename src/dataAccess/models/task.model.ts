export interface TaskModel {
  Id: number;
  Module_Id: number;
  Name: string;
  Threshold: number;
  Order: number;
  Cost: number;
  Visibility: 0 | 1;
  CreatedBy: number;
  Animated: 0 | 1;
  AnimationSteps: number;
  AnimationStepTime: number;
  Data: TaskDataModel;
}

export interface TaskDataModel {
  vertexShader: string;
  fragmentShader: string;
  defaultVertexShader: string;
  defaultFragmentShader: string;
  description: string;
}

export interface TaskChannelModel {
  Task_Id: number;
  Index: number;
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
  Liked?: 0 | 1 | null;
  Data: UserTaskDataModel;
}

export interface UserTaskDataModel {
  vertexShader: string;
  fragmentShader: string;
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
