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
  VertexCodeEditable: 0 | 1;
  FragmentCodeEditable: 0 | 1;
}

export interface TaskDataModel {
  vertexShader: string;
  fragmentShader: string;
  defaultVertexShader: string;
  defaultFragmentShader: string;
  description: string;
  sceneSettings: JSON;
}

export interface TaskChannelModel {
  Task_Id: number;
  Index: number;
}

export interface TaskLinterRule {
  Id: number | null;
  Task_Id: number;
  Keyword: string;
  Message: string;
  // 0 - info | 1 - warning | 2 - error;
  Severity: number;
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
  AcceptedAt: Date | null;
}

export interface UserTaskSubmissionModel {
  User_Id: number;
  Task_Id: number;
  Score: number;
  Accepted: 0 | 1;
  Data: UserTaskDataModel;
  At: Date;
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
  Locked: 0 | 1;
  Visibility: 0 | 1;
}

export interface TaskFeedbackModel {
  User_Id: number;
  Task_Id: number;
  UnclearDescription: 0 | 1;
  StrictRuntime: 0 | 1;
  Other: 0 | 1;
  Message: string;
}
