export interface ModuleModel {
  Id: number;
  Name: string;
  Description: string;
  CreatedBy: number;
  Order: number;
  Locked: 0 | 1;
  Cover: 0 | 1;
}

export interface ModuleListModel {
  Id: number;
  Name: string;
  Description: string;
  Order: number;
  Locked: 0 | 1;
  Tasks: number;
  Cover: 0 | 1;
}

export interface UserModuleListModel {
  Id: number;
  Name: string;
  Description: string;
  Order: number;
  Locked: 0 | 1;
  Tasks: number;
  AcceptedTasks: number;
  Cover: 0 | 1;
}
