import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { TaskListDto } from './tasks.dto';

export class ModuleDto {
  id: number;
  name: string;
  description: string;
  order: number;
  createdBy: { id: number; name: string };
  tasks: TaskListDto[];
  locked: boolean;
}

export class CreateModuleDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsBoolean()
  locked: boolean;
}

export class UpdateModuleDto extends CreateModuleDto {
  @IsNumber()
  id: number;
}

export class UpdateModuleNameDto {
  @IsString()
  name: string;
}

export class UpdateModuleDescriptionDto {
  @IsString()
  description: string;
}

export class ModuleTaskReorderDto {
  @IsNumber()
  oldOrder: number;

  @IsNumber()
  newOrder: number;
}

export interface ModuleListDto {
  id: number;
  name: string;
  description: string;
  tasks: number;
  order: number;
  locked: boolean;
}

export interface UserModuleListDto {
  id: number;
  name: string;
  description: string;
  tasks: number;
  acceptedTasks: number;
  order: number;
  locked: boolean;
}

export interface ModuleUserProgressDto {
  id: number;
  name: string;
  description: string;
  order: number;
  createdBy: { id: number; name: string };
  tasks: ModuleUserTaskProgressDto[];
  locked: boolean;
}

export interface ModuleUserTaskProgressDto {
  id: number;
  name: string;
  order: number;
  accepted: boolean;
  rejected: boolean;
  match: number;
  score: number;
}
